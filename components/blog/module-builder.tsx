"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, GripVertical, HelpCircle, MessageSquare, Image as ImageIcon, MapPin, Gift, Award, ChevronUp, ChevronDown } from "lucide-react";

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface ModuleBuilderProps {
  modules: Array<any>;
  onModulesChange: (modules: Array<any>) => void;
}

const MODULE_ICONS: Record<string, any> = {
  quiz_giveaway: HelpCircle,
  faq: MessageSquare,
  gallery: ImageIcon,
  crowdsourced_map: MapPin,
  instant_poll: Award,
  setup_showoff: Gift,
  ad_baris: Award,
};

export function BlogModuleBuilder({ modules, onModulesChange }: ModuleBuilderProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleAddModule = (type: string) => {
    let newModule: any;

    switch (type) {
      case "quiz_giveaway":
        newModule = {
          type: "quiz_giveaway",
          quizId: `quiz_${Date.now()}`,
          rewardText: "2 stiker eksklusif BALIKIN",
          minScoreToWin: 70,
          questions: [
            { question: "", options: ["", "", "", ""], correctAnswerIndex: 0 },
          ],
        };
        break;
      case "faq":
        newModule = {
          type: "faq",
          data: [{ question: "", answer: "" }],
        };
        break;
      case "gallery":
        newModule = {
          type: "gallery",
          images: [],
        };
        break;
      case "instant_poll":
        newModule = {
          type: "instant_poll",
          pollId: `poll_${Date.now()}`,
          question: "",
          options: ["", ""],
        };
        break;
      case "crowdsourced_map":
        newModule = {
          type: "crowdsourced_map",
          mapRegionId: "",
        };
        break;
      case "setup_showoff":
        newModule = {
          type: "setup_showoff",
          galleryId: "",
          incentiveDiscount: 10,
        };
        break;
      case "ad_baris":
        newModule = {
          type: "ad_baris",
          text: "",
          link: "",
          badge: "Ad",
        };
        break;
      default:
        return;
    }

    onModulesChange([...modules, newModule]);
    setIsAddDialogOpen(false);
  };

  const handleRemoveModule = (index: number) => {
    onModulesChange(modules.filter((_, i) => i !== index));
  };

  const handleMoveModule = (fromIndex: number, toIndex: number) => {
    const newModules = [...modules];
    const [moved] = newModules.splice(fromIndex, 1);
    newModules.splice(toIndex, 0, moved);
    onModulesChange(newModules);
  };

  const handleUpdateModule = (index: number, updatedModule: any) => {
    const newModules = [...modules];
    newModules[index] = updatedModule;
    onModulesChange(newModules);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Interactive Modules</CardTitle>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Module
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Select Module Type</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-auto flex-col gap-2 py-4"
                onClick={() => handleAddModule("quiz_giveaway")}
              >
                <HelpCircle className="w-6 h-6" />
                <span className="text-sm">Quiz & Giveaway</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col gap-2 py-4"
                onClick={() => handleAddModule("faq")}
              >
                <MessageSquare className="w-6 h-6" />
                <span className="text-sm">FAQ</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col gap-2 py-4"
                onClick={() => handleAddModule("instant_poll")}
              >
                <Award className="w-6 h-6" />
                <span className="text-sm">Poll</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col gap-2 py-4"
                onClick={() => handleAddModule("gallery")}
              >
                <ImageIcon className="w-6 h-6" />
                <span className="text-sm">Gallery</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col gap-2 py-4"
                onClick={() => handleAddModule("crowdsourced_map")}
              >
                <MapPin className="w-6 h-6" />
                <span className="text-sm">Lost Map</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col gap-2 py-4"
                onClick={() => handleAddModule("setup_showoff")}
              >
                <Gift className="w-6 h-6" />
                <span className="text-sm">Setup Showoff</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col gap-2 py-4 col-span-2"
                onClick={() => handleAddModule("ad_baris")}
              >
                <Award className="w-6 h-6" />
                <span className="text-sm">Ad Baris</span>
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-3">
        {modules.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No modules added yet. Click "Add Module" to enhance your article.
          </p>
        ) : (
          modules.map((module, index) => (
            <ModuleEditor
              key={index}
              module={module}
              index={index}
              onUpdate={(updated) => handleUpdateModule(index, updated)}
              onRemove={() => handleRemoveModule(index)}
              onMoveUp={index > 0 ? () => handleMoveModule(index, index - 1) : undefined}
              onMoveDown={index < modules.length - 1 ? () => handleMoveModule(index, index + 1) : undefined}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}

interface ModuleEditorProps {
  module: any;
  index: number;
  onUpdate: (module: any) => void;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

function ModuleEditor({ module, index, onUpdate, onRemove, onMoveUp, onMoveDown }: ModuleEditorProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const Icon = MODULE_ICONS[module.type] || Award;

  return (
    <div className="border rounded-lg bg-card overflow-hidden">
      <div
        className="flex items-center justify-between p-3 bg-accent/50 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
          <Icon className="w-5 h-5 text-primary" />
          <span className="font-medium capitalize">
            {module.type.replace(/_/g, " ")}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {onMoveUp && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onMoveUp();
              }}
            >
              <ChevronUp className="w-4 h-4" />
            </Button>
          )}
          {onMoveDown && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onMoveDown();
              }}
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-4">
          {module.type === "quiz_giveaway" && (
            <QuizModuleEditor module={module} onUpdate={onUpdate} />
          )}
          {module.type === "faq" && (
            <FAQModuleEditor module={module} onUpdate={onUpdate} />
          )}
          {module.type === "instant_poll" && (
            <PollModuleEditor module={module} onUpdate={onUpdate} />
          )}
          {module.type === "gallery" && (
            <GalleryModuleEditor module={module} onUpdate={onUpdate} />
          )}
          {module.type === "ad_baris" && (
            <AdBarisModuleEditor module={module} onUpdate={onUpdate} />
          )}
          {module.type === "crowdsourced_map" && (
            <MapModuleEditor module={module} onUpdate={onUpdate} />
          )}
          {module.type === "setup_showoff" && (
            <SetupShowoffModuleEditor module={module} onUpdate={onUpdate} />
          )}
        </div>
      )}
    </div>
  );
}

function QuizModuleEditor({ module, onUpdate }: { module: any; onUpdate: (m: any) => void }) {
  const handleAddQuestion = () => {
    onUpdate({
      ...module,
      questions: [
        ...module.questions,
        { question: "", options: ["", "", "", ""], correctAnswerIndex: 0 },
      ],
    });
  };

  const handleUpdateQuestion = (qIndex: number, updated: QuizQuestion) => {
    const newQuestions = [...module.questions];
    newQuestions[qIndex] = updated;
    onUpdate({ ...module, questions: newQuestions });
  };

  const handleRemoveQuestion = (qIndex: number) => {
    onUpdate({
      ...module,
      questions: module.questions.filter((_: any, i: number) => i !== qIndex),
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Reward Text</Label>
          <Input
            value={module.rewardText}
            onChange={(e) => onUpdate({ ...module, rewardText: e.target.value })}
            placeholder="e.g., 2 stiker eksklusif BALIKIN"
          />
        </div>
        <div className="space-y-2">
          <Label>Min Score to Win (%)</Label>
          <Input
            type="number"
            min="0"
            max="100"
            value={module.minScoreToWin}
            onChange={(e) => onUpdate({ ...module, minScoreToWin: parseInt(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Questions</Label>
          <Button size="sm" variant="outline" onClick={handleAddQuestion}>
            <Plus className="w-4 h-4 mr-1" />
            Add Question
          </Button>
        </div>

        {module.questions.map((q: QuizQuestion, qIndex: number) => (
          <Card key={qIndex} className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Question {qIndex + 1}</Label>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 text-destructive"
                  onClick={() => handleRemoveQuestion(qIndex)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>

              <Input
                value={q.question}
                onChange={(e) =>
                  handleUpdateQuestion(qIndex, { ...q, question: e.target.value })
                }
                placeholder="Enter question..."
              />

              <div className="space-y-2">
                <Label className="text-xs">Options</Label>
                {q.options.map((option, oIndex) => (
                  <div key={oIndex} className="flex items-center gap-2">
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        q.correctAnswerIndex === oIndex
                          ? "border-primary bg-primary"
                          : "border-muted-foreground"
                      }`}
                    >
                      {q.correctAnswerIndex === oIndex && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                    <Input
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...q.options];
                        newOptions[oIndex] = e.target.value;
                        handleUpdateQuestion(qIndex, { ...q, options: newOptions });
                      }}
                      placeholder={`Option ${oIndex + 1}`}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-2"
                      onClick={() =>
                        handleUpdateQuestion(qIndex, { ...q, correctAnswerIndex: oIndex })
                      }
                    >
                      Set Correct
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function FAQModuleEditor({ module, onUpdate }: { module: any; onUpdate: (m: any) => void }) {
  const handleAddFAQ = () => {
    onUpdate({
      ...module,
      data: [...module.data, { question: "", answer: "" }],
    });
  };

  const handleUpdateFAQ = (index: number, updated: FAQItem) => {
    const newData = [...module.data];
    newData[index] = updated;
    onUpdate({ ...module, data: newData });
  };

  const handleRemoveFAQ = (index: number) => {
    onUpdate({
      ...module,
      data: module.data.filter((_: any, i: number) => i !== index),
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>FAQ Items</Label>
        <Button size="sm" variant="outline" onClick={handleAddFAQ}>
          <Plus className="w-4 h-4 mr-1" />
          Add FAQ
        </Button>
      </div>

      {module.data.map((item: FAQItem, index: number) => (
        <Card key={index} className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">FAQ {index + 1}</Label>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-destructive"
                onClick={() => handleRemoveFAQ(index)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>

            <Input
              value={item.question}
              onChange={(e) =>
                handleUpdateFAQ(index, { ...item, question: e.target.value })
              }
              placeholder="Question..."
            />

            <Textarea
              value={item.answer}
              onChange={(e) =>
                handleUpdateFAQ(index, { ...item, answer: e.target.value })
              }
              placeholder="Answer..."
              rows={3}
            />
          </div>
        </Card>
      ))}
    </div>
  );
}

function PollModuleEditor({ module, onUpdate }: { module: any; onUpdate: (m: any) => void }) {
  const handleAddOption = () => {
    onUpdate({
      ...module,
      options: [...module.options, ""],
    });
  };

  const handleUpdateOption = (index: number, value: string) => {
    const newOptions = [...module.options];
    newOptions[index] = value;
    onUpdate({ ...module, options: newOptions });
  };

  const handleRemoveOption = (index: number) => {
    onUpdate({
      ...module,
      options: module.options.filter((_: string, i: number) => i !== index),
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Poll Question</Label>
        <Input
          value={module.question}
          onChange={(e) => onUpdate({ ...module, question: e.target.value })}
          placeholder="Ask your readers..."
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Options</Label>
          <Button size="sm" variant="outline" onClick={handleAddOption}>
            <Plus className="w-4 h-4 mr-1" />
            Add Option
          </Button>
        </div>

        {module.options.map((option: string, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">{index + 1}.</span>
            <Input
              value={option}
              onChange={(e) => handleUpdateOption(index, e.target.value)}
              placeholder={`Option ${index + 1}`}
            />
            {module.options.length > 2 && (
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-destructive"
                onClick={() => handleRemoveOption(index)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function GalleryModuleEditor({ module, onUpdate }: { module: any; onUpdate: (m: any) => void }) {
  return (
    <div className="space-y-3">
      <Label>Gallery Images</Label>
      <p className="text-sm text-muted-foreground">
        Image URLs (one per line):
      </p>
      <Textarea
        value={module.images.join("\n")}
        onChange={(e) =>
          onUpdate({ ...module, images: e.target.value.split("\n").filter(Boolean) })
        }
        placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
        rows={5}
      />
    </div>
  );
}

function AdBarisModuleEditor({ module, onUpdate }: { module: any; onUpdate: (m: any) => void }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Ad Text</Label>
        <Input
          value={module.text}
          onChange={(e) => onUpdate({ ...module, text: e.target.value })}
          placeholder="Promotional message..."
        />
      </div>

      <div className="space-y-2">
        <Label>Link URL</Label>
        <Input
          value={module.link}
          onChange={(e) => onUpdate({ ...module, link: e.target.value })}
          placeholder="https://..."
        />
      </div>

      <div className="space-y-2">
        <Label>Badge Text</Label>
        <Input
          value={module.badge || ""}
          onChange={(e) => onUpdate({ ...module, badge: e.target.value })}
          placeholder="e.g., Ad, Sponsored"
        />
      </div>
    </div>
  );
}

function MapModuleEditor({ module, onUpdate }: { module: any; onUpdate: (m: any) => void }) {
  return (
    <div className="space-y-2">
      <Label>Map Region ID</Label>
      <Input
        value={module.mapRegionId}
        onChange={(e) => onUpdate({ ...module, mapRegionId: e.target.value })}
        placeholder="e.g., indonesia-jakarta"
      />
      <p className="text-xs text-muted-foreground">
        This will display a map of lost location reports for the specified region.
      </p>
    </div>
  );
}

function SetupShowoffModuleEditor({ module, onUpdate }: { module: any; onUpdate: (m: any) => void }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Gallery ID</Label>
        <Input
          value={module.galleryId}
          onChange={(e) => onUpdate({ ...module, galleryId: e.target.value })}
          placeholder="e.g., user-setup-gallery-123"
        />
      </div>

      <div className="space-y-2">
        <Label>Incentive Discount (%)</Label>
        <Input
          type="number"
          min="0"
          max="100"
          value={module.incentiveDiscount}
          onChange={(e) => onUpdate({ ...module, incentiveDiscount: parseInt(e.target.value) || 0 })}
        />
        <p className="text-xs text-muted-foreground">
          Discount users get for sharing their setup photos.
        </p>
      </div>
    </div>
  );
}
