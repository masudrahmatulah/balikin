import { NextRequest, NextResponse } from 'next/server';
import {
  RAJAONGKIR_BASE_URL,
  RAJAONGKIR_ORIGIN_CITY_ID,
  STICKER_WEIGHT_GRAMS,
  SHIPPING_API_TIMEOUT_MS,
  SHIPPING_FALLBACK_LUAR_KALSEL,
} from '@/lib/constants';

const API_KEY = process.env.RAJAONGKIR_API_KEY;

if (!API_KEY) {
  throw new Error('RAJAONGKIR_API_KEY is not defined in environment variables');
}

type RajaOngkirResponse<T> = {
  status: number;
  code: string;
  data: T | null;
  rajaongkir?: {
    status: { code: number; description: string };
    results?: T;
  };
};

async function fetchWithTimeout<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SHIPPING_API_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`RajaOngkir API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } finally {
    clearTimeout(timeout);
  }
}

// GET /api/shipping?type=provinces
async function handleGetProvinces() {
  try {
    const response = await fetchWithTimeout<{
      query: unknown;
      status: { code: number; description: string };
      results: Array<{ province_id: string; province: string }>;
    }>(
      `${RAJAONGKIR_BASE_URL}/province`,
      {
        headers: {
          key: API_KEY,
        },
      }
    );

    if (response.rajaongkir?.status.code === 200) {
      return NextResponse.json({
        success: true,
        data: response.rajaongkir.results || [],
      });
    }

    throw new Error('Failed to fetch provinces');
  } catch (error) {
    console.error('Error fetching provinces:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch provinces' },
      { status: 500 }
    );
  }
}

// GET /api/shipping?type=cities&province=<id>
async function handleGetCities(provinceId: string) {
  if (!provinceId) {
    return NextResponse.json(
      { success: false, error: 'Province ID is required' },
      { status: 400 }
    );
  }

  try {
    const response = await fetchWithTimeout<{
      query: unknown;
      status: { code: number; description: string };
      results: Array<{
        city_id: string;
        province_id: string;
        province: string;
        city_name: string;
        type: string;
        postal_code: string;
      }>;
    }>(
      `${RAJAONGKIR_BASE_URL}/city?province=${provinceId}`,
      {
        headers: {
          key: API_KEY,
        },
      }
    );

    if (response.rajaongkir?.status.code === 200) {
      return NextResponse.json({
        success: true,
        data: response.rajaongkir.results || [],
      });
    }

    throw new Error('Failed to fetch cities');
  } catch (error) {
    console.error('Error fetching cities:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cities' },
      { status: 500 }
    );
  }
}

// POST /api/shipping
async function handleGetCost(body: unknown) {
  try {
    const input = body as {
      destinationCityId?: string;
      courier?: string;
    };

    if (!input.destinationCityId || !input.courier) {
      return NextResponse.json(
        { success: false, error: 'Destination city ID and courier are required' },
        { status: 400 }
      );
    }

    const courier = input.courier.toLowerCase();
    const validCouriers = ['jne', 'tiki', 'pos'];
    if (!validCouriers.includes(courier)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid courier. Must be one of: ${validCouriers.join(', ')}`,
        },
        { status: 400 }
      );
    }

    const response = await fetchWithTimeout<{
      query: unknown;
      status: { code: number; description: string };
      origin_details?: {
        city_id: string;
        province_id: string;
        province: string;
        type: string;
        city_name: string;
        postal_code: string;
      };
      destination_details?: {
        city_id: string;
        province_id: string;
        province: string;
        type: string;
        city_name: string;
        postal_code: string;
      };
      results?: Array<{
        code: string;
        name: string;
        costs: Array<{
          service: string;
          description: string;
          cost: Array<{ value: number; etd: string; note: string }>;
        }>;
      }>;
    }>(
      `${RAJAONGKIR_BASE_URL}/cost`,
      {
        method: 'POST',
        headers: {
          key: API_KEY,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          origin: RAJAONGKIR_ORIGIN_CITY_ID,
          destination: input.destinationCityId,
          weight: STICKER_WEIGHT_GRAMS.toString(),
          courier,
        }).toString(),
      }
    );

    if (response.rajaongkir?.status.code === 200) {
      const courierData = response.rajaongkir.results?.[0];
      if (courierData && courierData.costs.length > 0) {
        const cost = courierData.costs[0]; // Take first service option
        const shippingCost = cost.cost[0]?.value || SHIPPING_FALLBACK_LUAR_KALSEL;

        return NextResponse.json({
          success: true,
          data: {
            courier: courierData.code.toUpperCase(),
            service: cost.service,
            description: cost.description,
            cost: shippingCost,
            etd: cost.cost[0]?.etd || 'N/A',
            fallback: false,
          },
        });
      }
    }

    throw new Error('No shipping cost found');
  } catch (error) {
    console.error('Error fetching shipping cost:', error);

    // Fallback ke tarif flat jika API timeout/error
    return NextResponse.json({
      success: true,
      data: {
        cost: SHIPPING_FALLBACK_LUAR_KALSEL,
        fallback: true,
        message: 'Using fallback shipping cost due to API timeout',
      },
    });
  }
}

// Main route handler
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const type = url.searchParams.get('type');

  if (type === 'provinces') {
    return handleGetProvinces();
  } else if (type === 'cities') {
    const provinceId = url.searchParams.get('province');
    return handleGetCities(provinceId || '');
  }

  return NextResponse.json(
    { success: false, error: 'Invalid request type' },
    { status: 400 }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return handleGetCost(body);
  } catch (error) {
    console.error('Error parsing request:', error);
    return NextResponse.json(
      { success: false, error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
