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

type KomerceResponse<T> = {
  meta: { code: number; status: string; message: string };
  data: T | null;
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
    const response = await fetchWithTimeout<
      KomerceResponse<Array<{ id: number; name: string }>>
    >(`${RAJAONGKIR_BASE_URL}/destination/province`, {
      headers: {
        key: API_KEY,
      },
    });

    if (response.meta.code === 200 && response.data) {
      return NextResponse.json({
        success: true,
        data: response.data.map((p) => ({
          province_id: String(p.id),
          province: p.name,
        })),
      });
    }

    throw new Error(response.meta.message || 'Failed to fetch provinces');
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
    const response = await fetchWithTimeout<
      KomerceResponse<Array<{ id: number; name: string; zip_code: string }>>
    >(`${RAJAONGKIR_BASE_URL}/destination/city/${provinceId}`, {
      headers: {
        key: API_KEY,
      },
    });

    if (response.meta.code === 200 && response.data) {
      return NextResponse.json({
        success: true,
        data: response.data.map((c) => ({
          city_id: String(c.id),
          city_name: c.name,
          province: '',
          postal_code: c.zip_code,
        })),
      });
    }

    throw new Error(response.meta.message || 'Failed to fetch cities');
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

    const response = await fetchWithTimeout<
      KomerceResponse<
        Array<{
          name: string;
          code: string;
          service: string;
          description: string;
          cost: number;
          etd: string;
        }>
      >
    >(`${RAJAONGKIR_BASE_URL}/calculate/domestic-cost`, {
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
    });

    if (response.meta.code === 200 && response.data && response.data.length > 0) {
      // API tidak mengurutkan berdasarkan termurah, jadi pilih manual
      const service = [...response.data].sort((a, b) => a.cost - b.cost)[0];

      return NextResponse.json({
        success: true,
        data: {
          courier: service.code.toUpperCase(),
          service: service.service,
          description: service.description,
          cost: service.cost || SHIPPING_FALLBACK_LUAR_KALSEL,
          etd: service.etd || 'N/A',
          fallback: false,
        },
      });
    }

    throw new Error(response.meta.message || 'No shipping cost found');
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
