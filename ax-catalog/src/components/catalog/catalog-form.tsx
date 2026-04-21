"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, X, Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useFilters } from "@/hooks/use-filters";
import {
  CATEGORY_LABELS,
  DELIVERY_TYPE_LABELS,
  DELIVERY_MODEL_LABELS,
} from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const catalogFormSchema = z.object({
  name: z.string().min(2, "이름은 2자 이상이어야 합니다"),
  category: z.enum(["PRODUCT", "TECHNOLOGY", "SERVICE"], {
    required_error: "카테고리를 선택해주세요",
  }),
  valueProposition: z.string().min(1, "가치 제안을 입력해주세요"),
  keyFeatures: z.string().min(1, "주요 특징을 입력해주세요"),
  differentiation: z.string().min(1, "차별화 요소를 입력해주세요"),
  deliveryType: z.enum(["SAAS", "BUILD", "HYBRID"], {
    required_error: "딜리버리 유형을 선택해주세요",
  }),
  deliveryModel: z.enum(["PROJECT_BASED", "SUBSCRIPTION", "MANAGED"], {
    required_error: "딜리버리 모델을 선택해주세요",
  }),
  targetIndustryId: z.string().min(1, "대상 산업을 선택해주세요"),
  owningOrgId: z.string().min(1, "담당 조직을 선택해주세요"),
  techStacks: z
    .array(
      z.object({
        techDomain: z.string().min(1, "기술 도메인을 입력해주세요"),
        techCategory: z.string().min(1, "기술 카테고리를 입력해주세요"),
        techAsset: z.string().min(1, "기술 자산을 입력해주세요"),
      }),
    )
    .min(1, "최소 1개의 기술 스택을 추가해주세요"),
  useCases: z.array(
    z.object({
      customerName: z.string().min(1, "고객명을 입력해주세요"),
      industryId: z.string().min(1, "산업을 선택해주세요"),
      projectName: z.string().min(1, "프로젝트명을 입력해주세요"),
      projectOverview: z.string().min(1, "프로젝트 개요를 입력해주세요"),
      projectSize: z.string().optional(),
      duration: z.string().optional(),
    }),
  ),
});

type CatalogFormValues = z.infer<typeof catalogFormSchema>;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export type CatalogFormInitialData = {
  id: string;
  name: string;
  category: string;
  valueProposition: string;
  keyFeatures: string;
  differentiation: string;
  deliveryType: string;
  deliveryModel: string;
  targetIndustryId: string;
  owningOrgId: string;
  techStacks: { techDomain: string; techCategory: string; techAsset: string }[];
  useCases: {
    customerName: string;
    industryId: string;
    projectName: string;
    projectOverview: string;
    projectSize?: number | null;
    duration?: string | null;
  }[];
};

type CatalogFormProps = {
  initialData?: CatalogFormInitialData;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CatalogForm({ initialData }: CatalogFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { industries, organizations, isLoading: filtersLoading } = useFilters();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!initialData;

  const form = useForm<CatalogFormValues>({
    resolver: zodResolver(catalogFormSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          category: initialData.category as CatalogFormValues["category"],
          valueProposition: initialData.valueProposition,
          keyFeatures: initialData.keyFeatures,
          differentiation: initialData.differentiation,
          deliveryType: initialData.deliveryType as CatalogFormValues["deliveryType"],
          deliveryModel: initialData.deliveryModel as CatalogFormValues["deliveryModel"],
          targetIndustryId: initialData.targetIndustryId,
          owningOrgId: initialData.owningOrgId,
          techStacks: initialData.techStacks,
          useCases: initialData.useCases.map((uc) => ({
            customerName: uc.customerName,
            industryId: uc.industryId,
            projectName: uc.projectName,
            projectOverview: uc.projectOverview,
            projectSize: uc.projectSize?.toString() ?? "",
            duration: uc.duration ?? "",
          })),
        }
      : {
          name: "",
          valueProposition: "",
          keyFeatures: "",
          differentiation: "",
          targetIndustryId: "",
          owningOrgId: "",
          techStacks: [{ techDomain: "", techCategory: "", techAsset: "" }],
          useCases: [],
        },
  });

  const {
    fields: techFields,
    append: appendTech,
    remove: removeTech,
  } = useFieldArray({ control: form.control, name: "techStacks" });

  const {
    fields: useCaseFields,
    append: appendUseCase,
    remove: removeUseCase,
  } = useFieldArray({ control: form.control, name: "useCases" });

  // ---------------------------------------------------------------------------
  // Submit
  // ---------------------------------------------------------------------------

  const submitForm = async (
    data: CatalogFormValues,
    status: "DRAFT" | "PUBLISHED",
  ) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        status,
        useCases: data.useCases.map((uc) => ({
          ...uc,
          projectSize: uc.projectSize ? parseInt(uc.projectSize, 10) : undefined,
          duration: uc.duration || undefined,
        })),
      };

      const url = initialData
        ? `/api/catalog/${initialData.id}`
        : "/api/catalog";
      const method = initialData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error ?? "저장에 실패했습니다");
      }

      toast({
        title: "저장 완료",
        description:
          status === "PUBLISHED"
            ? "항목이 게시되었습니다."
            : "초안이 저장되었습니다.",
      });

      router.push("/input");
      router.refresh();
    } catch (error) {
      toast({
        title: "오류",
        description:
          error instanceof Error
            ? error.message
            : "저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    form.handleSubmit((data) => submitForm(data, "DRAFT"))();
  };

  const handlePublish = () => {
    form.handleSubmit((data) => submitForm(data, "PUBLISHED"))();
  };

  // ---------------------------------------------------------------------------
  // Field error helper
  // ---------------------------------------------------------------------------

  const FieldError = ({ message }: { message?: string }) =>
    message ? (
      <p className="mt-1 text-sm text-destructive">{message}</p>
    ) : null;

  // ---------------------------------------------------------------------------
  // Accordion default open state
  // ---------------------------------------------------------------------------

  const allSections = [
    "basic-info",
    "key-features",
    "delivery",
    "tech-stack",
    "use-cases",
  ];

  const defaultOpenSections = isEditMode ? ["basic-info"] : allSections;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Card>
      <CardContent className="pt-6">
        <Accordion
          type="multiple"
          defaultValue={defaultOpenSections}
          className="w-full"
        >
          {/* ---------------------------------------------------------------- */}
          {/* Section 1: 기본 정보 */}
          {/* ---------------------------------------------------------------- */}
          <AccordionItem value="basic-info">
            <AccordionTrigger className="text-base font-semibold">
              기본 정보
            </AccordionTrigger>
            <AccordionContent className="space-y-5 px-1">
              {/* Category */}
              <div className="space-y-2">
                <Label>카테고리 *</Label>
                <Controller
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex flex-wrap gap-4"
                    >
                      {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                        <div
                          key={value}
                          className="flex items-center space-x-2"
                        >
                          <RadioGroupItem
                            value={value}
                            id={`category-${value}`}
                          />
                          <Label
                            htmlFor={`category-${value}`}
                            className="font-normal"
                          >
                            {label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                />
                <FieldError
                  message={form.formState.errors.category?.message}
                />
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">항목명 *</Label>
                <Input
                  id="name"
                  placeholder="항목명을 입력하세요"
                  {...form.register("name")}
                />
                <FieldError message={form.formState.errors.name?.message} />
              </div>

              {/* Value Proposition */}
              <div className="space-y-2">
                <Label htmlFor="valueProposition">가치 제안 *</Label>
                <Textarea
                  id="valueProposition"
                  placeholder="이 항목이 제공하는 핵심 가치를 설명하세요"
                  rows={3}
                  {...form.register("valueProposition")}
                />
                <FieldError
                  message={form.formState.errors.valueProposition?.message}
                />
              </div>

              {/* Target Industry */}
              <div className="space-y-2">
                <Label>대상 산업 *</Label>
                <Controller
                  control={form.control}
                  name="targetIndustryId"
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={filtersLoading}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            filtersLoading ? "불러오는 중..." : "산업 선택"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {industries.map((ind) => (
                          <SelectItem key={ind.id} value={ind.id}>
                            {ind.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError
                  message={form.formState.errors.targetIndustryId?.message}
                />
              </div>

              {/* Owning Organization */}
              <div className="space-y-2">
                <Label>담당 조직 *</Label>
                <Controller
                  control={form.control}
                  name="owningOrgId"
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={filtersLoading}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            filtersLoading ? "불러오는 중..." : "조직 선택"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {organizations.map((org) => (
                          <SelectItem key={org.id} value={org.id}>
                            {org.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError
                  message={form.formState.errors.owningOrgId?.message}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* ---------------------------------------------------------------- */}
          {/* Section 2: 주요 특징 */}
          {/* ---------------------------------------------------------------- */}
          <AccordionItem value="key-features">
            <AccordionTrigger className="text-base font-semibold">
              주요 특징
            </AccordionTrigger>
            <AccordionContent className="space-y-5 px-1">
              <div className="space-y-2">
                <Label htmlFor="keyFeatures">주요 특징 *</Label>
                <Textarea
                  id="keyFeatures"
                  placeholder="주요 기능 및 특징을 기술하세요"
                  rows={4}
                  {...form.register("keyFeatures")}
                />
                <FieldError
                  message={form.formState.errors.keyFeatures?.message}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="differentiation">차별화 요소 *</Label>
                <Textarea
                  id="differentiation"
                  placeholder="경쟁 제품 대비 차별화 포인트를 기술하세요"
                  rows={4}
                  {...form.register("differentiation")}
                />
                <FieldError
                  message={form.formState.errors.differentiation?.message}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* ---------------------------------------------------------------- */}
          {/* Section 3: 딜리버리 */}
          {/* ---------------------------------------------------------------- */}
          <AccordionItem value="delivery">
            <AccordionTrigger className="text-base font-semibold">
              딜리버리
            </AccordionTrigger>
            <AccordionContent className="space-y-5 px-1">
              {/* Delivery Type */}
              <div className="space-y-2">
                <Label>딜리버리 유형 *</Label>
                <Controller
                  control={form.control}
                  name="deliveryType"
                  render={({ field }) => (
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex flex-wrap gap-4"
                    >
                      {Object.entries(DELIVERY_TYPE_LABELS).map(
                        ([value, label]) => (
                          <div
                            key={value}
                            className="flex items-center space-x-2"
                          >
                            <RadioGroupItem
                              value={value}
                              id={`deliveryType-${value}`}
                            />
                            <Label
                              htmlFor={`deliveryType-${value}`}
                              className="font-normal"
                            >
                              {label}
                            </Label>
                          </div>
                        ),
                      )}
                    </RadioGroup>
                  )}
                />
                <FieldError
                  message={form.formState.errors.deliveryType?.message}
                />
              </div>

              {/* Delivery Model */}
              <div className="space-y-2">
                <Label>딜리버리 모델 *</Label>
                <Controller
                  control={form.control}
                  name="deliveryModel"
                  render={({ field }) => (
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex flex-wrap gap-4"
                    >
                      {Object.entries(DELIVERY_MODEL_LABELS).map(
                        ([value, label]) => (
                          <div
                            key={value}
                            className="flex items-center space-x-2"
                          >
                            <RadioGroupItem
                              value={value}
                              id={`deliveryModel-${value}`}
                            />
                            <Label
                              htmlFor={`deliveryModel-${value}`}
                              className="font-normal"
                            >
                              {label}
                            </Label>
                          </div>
                        ),
                      )}
                    </RadioGroup>
                  )}
                />
                <FieldError
                  message={form.formState.errors.deliveryModel?.message}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* ---------------------------------------------------------------- */}
          {/* Section 4: 적용 기술 */}
          {/* ---------------------------------------------------------------- */}
          <AccordionItem value="tech-stack">
            <AccordionTrigger className="text-base font-semibold">
              적용 기술
            </AccordionTrigger>
            <AccordionContent className="space-y-4 px-1">
              {techFields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-3">
                  <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="space-y-1">
                      {index === 0 && (
                        <Label className="text-xs text-muted-foreground">
                          기술 도메인
                        </Label>
                      )}
                      <Input
                        placeholder="기술 도메인"
                        {...form.register(`techStacks.${index}.techDomain`)}
                      />
                      <FieldError
                        message={
                          form.formState.errors.techStacks?.[index]?.techDomain
                            ?.message
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      {index === 0 && (
                        <Label className="text-xs text-muted-foreground">
                          기술 카테고리
                        </Label>
                      )}
                      <Input
                        placeholder="기술 카테고리"
                        {...form.register(`techStacks.${index}.techCategory`)}
                      />
                      <FieldError
                        message={
                          form.formState.errors.techStacks?.[index]
                            ?.techCategory?.message
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      {index === 0 && (
                        <Label className="text-xs text-muted-foreground">
                          기술 자산
                        </Label>
                      )}
                      <Input
                        placeholder="기술 자산"
                        {...form.register(`techStacks.${index}.techAsset`)}
                      />
                      <FieldError
                        message={
                          form.formState.errors.techStacks?.[index]?.techAsset
                            ?.message
                        }
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="mt-1 shrink-0"
                    onClick={() => removeTech(index)}
                    disabled={techFields.length <= 1}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <FieldError
                message={form.formState.errors.techStacks?.root?.message}
              />

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  appendTech({
                    techDomain: "",
                    techCategory: "",
                    techAsset: "",
                  })
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                기술 스택 추가
              </Button>
            </AccordionContent>
          </AccordionItem>

          {/* ---------------------------------------------------------------- */}
          {/* Section 5: 활용 사례 */}
          {/* ---------------------------------------------------------------- */}
          <AccordionItem value="use-cases">
            <AccordionTrigger className="text-base font-semibold">
              활용 사례
            </AccordionTrigger>
            <AccordionContent className="space-y-4 px-1">
              {useCaseFields.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  등록된 활용 사례가 없습니다. 아래 버튼으로 추가하세요.
                </p>
              )}

              {useCaseFields.map((field, index) => (
                <div
                  key={field.id}
                  className="relative rounded-lg border bg-muted/30 p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-medium">
                      사례 {index + 1}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeUseCase(index)}
                    >
                      <X className="mr-1 h-3 w-3" />
                      삭제
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Customer Name */}
                    <div className="space-y-1">
                      <Label className="text-xs">고객명 *</Label>
                      <Input
                        placeholder="고객명"
                        {...form.register(`useCases.${index}.customerName`)}
                      />
                      <FieldError
                        message={
                          form.formState.errors.useCases?.[index]?.customerName
                            ?.message
                        }
                      />
                    </div>

                    {/* Industry */}
                    <div className="space-y-1">
                      <Label className="text-xs">산업 *</Label>
                      <Controller
                        control={form.control}
                        name={`useCases.${index}.industryId`}
                        render={({ field: selectField }) => (
                          <Select
                            onValueChange={selectField.onChange}
                            value={selectField.value}
                            disabled={filtersLoading}
                          >
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  filtersLoading
                                    ? "불러오는 중..."
                                    : "산업 선택"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {industries.map((ind) => (
                                <SelectItem key={ind.id} value={ind.id}>
                                  {ind.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <FieldError
                        message={
                          form.formState.errors.useCases?.[index]?.industryId
                            ?.message
                        }
                      />
                    </div>

                    {/* Project Name */}
                    <div className="space-y-1">
                      <Label className="text-xs">프로젝트명 *</Label>
                      <Input
                        placeholder="프로젝트명"
                        {...form.register(`useCases.${index}.projectName`)}
                      />
                      <FieldError
                        message={
                          form.formState.errors.useCases?.[index]?.projectName
                            ?.message
                        }
                      />
                    </div>

                    {/* Project Size */}
                    <div className="space-y-1">
                      <Label className="text-xs">프로젝트 규모 (만원)</Label>
                      <Input
                        type="number"
                        placeholder="프로젝트 규모"
                        {...form.register(`useCases.${index}.projectSize`)}
                      />
                    </div>

                    {/* Duration */}
                    <div className="space-y-1">
                      <Label className="text-xs">기간</Label>
                      <Input
                        placeholder="예: 6개월"
                        {...form.register(`useCases.${index}.duration`)}
                      />
                    </div>
                  </div>

                  {/* Project Overview - full width */}
                  <div className="mt-4 space-y-1">
                    <Label className="text-xs">프로젝트 개요 *</Label>
                    <Textarea
                      placeholder="프로젝트 개요를 입력하세요"
                      rows={3}
                      {...form.register(`useCases.${index}.projectOverview`)}
                    />
                    <FieldError
                      message={
                        form.formState.errors.useCases?.[index]?.projectOverview
                          ?.message
                      }
                    />
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  appendUseCase({
                    customerName: "",
                    industryId: "",
                    projectName: "",
                    projectOverview: "",
                    projectSize: "",
                    duration: "",
                  })
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                활용 사례 추가
              </Button>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>

      <Separator />

      <CardFooter className="flex justify-between gap-3 pt-6">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/input")}
          disabled={isSubmitting}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          취소
        </Button>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleSaveDraft}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            초안 저장
          </Button>
          <Button
            type="button"
            onClick={handlePublish}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            게시
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
