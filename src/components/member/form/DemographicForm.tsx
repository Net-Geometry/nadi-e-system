import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DialogTitle } from "@/components/ui/dialog";

type DemographicData = {
  nationality_id: string;
  race_id: string;
  ethnic_id: string;
  occupation_id: string;
  type_sector: string;
  socio_id: string;
  income_range: string;
  ict_knowledge: string;
  education_level: string;
  oku_status: boolean | null;
};

type DemographicFormProps = DemographicData & {
  updateFields: (fields: Partial<DemographicData>) => void;
  nationalities: { id: string; eng: string }[];
  races: { id: string; eng: string }[];
  ethnics: { id: string; eng: string }[];
  occupations: { id: string; eng: string }[];
  typeSectors: { id: string; eng: string }[];
  socioeconomics: { id: string; eng: string }[];
  incomeLevels: { id: string; eng: string }[];
  ictKnowledge: { id: string; eng: string }[];
  educationLevels: { id: string; eng: string }[];
};

export function DemographicForm({
  nationality_id,
  race_id,
  ethnic_id,
  occupation_id,
  type_sector,
  socio_id,
  income_range,
  ict_knowledge,
  education_level,
  oku_status,
  updateFields,
  nationalities,
  races,
  ethnics,
  occupations,
  typeSectors,
  socioeconomics,
  incomeLevels,
  ictKnowledge,
  educationLevels,
}: DemographicFormProps) {
  return (
    <>
      <DialogTitle className="mb-4">Demographic Information</DialogTitle>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nationality */}
        <div className="space-y-2 mb-4">
          <Label className="flex items-center">Nationality <span className="text-red-500 ml-1">*</span></Label>
          <Select
            value={nationality_id || ""}
            onValueChange={(value) => updateFields({ nationality_id: value })}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select nationality" />
            </SelectTrigger>
            <SelectContent>
              {nationalities.map((nationality) => (
                <SelectItem key={nationality.id} value={nationality.id.toString()}>
                  {nationality.eng}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Race */}
        <div className="space-y-2 mb-4">
          <Label className="flex items-center">Race <span className="text-red-500 ml-1">*</span></Label>
          <Select
            value={race_id || ""}
            onValueChange={(value) => updateFields({ race_id: value })}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select race" />
            </SelectTrigger>
            <SelectContent>
              {races.map((race) => (
                <SelectItem key={race.id} value={race.id.toString()}>
                  {race.eng}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Ethnic */}
        <div className="space-y-2 mb-4">
          <Label className="flex items-center">Ethnic <span className="text-red-500 ml-1">*</span></Label>
          <Select
            value={ethnic_id || ""}
            onValueChange={(value) => updateFields({ ethnic_id: value })}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select ethnic" />
            </SelectTrigger>
            <SelectContent>
              {ethnics.map((ethnic) => (
                <SelectItem key={ethnic.id} value={ethnic.id.toString()}>
                  {ethnic.eng}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Occupation */}
        <div className="space-y-2 mb-4">
          <Label className="flex items-center">Occupation</Label>
          <Select
            value={occupation_id || ""}
            onValueChange={(value) => updateFields({ occupation_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select occupation" />
            </SelectTrigger>
            <SelectContent>
              {occupations.map((occupation) => (
                <SelectItem key={occupation.id} value={occupation.id.toString()}>
                  {occupation.eng}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sector */}
        <div className="space-y-2 mb-4">
          <Label className="flex items-center">Sector</Label>
          <Select
            value={type_sector || ""}
            onValueChange={(value) => updateFields({ type_sector: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select sector" />
            </SelectTrigger>
            <SelectContent>
              {typeSectors.map((sector) => (
                <SelectItem key={sector.id} value={sector.id.toString()}>
                  {sector.eng}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Socioeconomic */}
        <div className="space-y-2 mb-4">
          <Label className="flex items-center">Socioeconomic</Label>
          <Select
            value={socio_id || ""}
            onValueChange={(value) => updateFields({ socio_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select socioeconomic" />
            </SelectTrigger>
            <SelectContent>
              {socioeconomics.map((socio) => (
                <SelectItem key={socio.id} value={socio.id.toString()}>
                  {socio.eng}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Income Range */}
        <div className="space-y-2 mb-4">
          <Label className="flex items-center">Income Range</Label>
          <Select
            value={income_range || ""}
            onValueChange={(value) => updateFields({ income_range: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select income range" />
            </SelectTrigger>
            <SelectContent>
              {incomeLevels.map((income) => (
                <SelectItem key={income.id} value={income.id.toString()}>
                  {income.eng}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* ICT Knowledge */}
        <div className="space-y-2 mb-4">
          <Label className="flex items-center">ICT Knowledge</Label>
          <Select
            value={ict_knowledge || ""}
            onValueChange={(value) => updateFields({ ict_knowledge: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select ICT knowledge" />
            </SelectTrigger>
            <SelectContent>
              {ictKnowledge.map((ict) => (
                <SelectItem key={ict.id} value={ict.id.toString()}>
                  {ict.eng}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Education Level */}
        <div className="space-y-2 mb-4">
          <Label className="flex items-center">Education Level</Label>
          <Select
            value={education_level || ""}
            onValueChange={(value) => updateFields({ education_level: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select education level" />
            </SelectTrigger>
            <SelectContent>
              {educationLevels.map((education) => (
                <SelectItem key={education.id} value={education.id.toString()}>
                  {education.eng}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* OKU Status */}
        <div className="space-y-2 mb-4">
          <Label className="flex items-center">OKU Status</Label>
          <RadioGroup
            value={oku_status?.toString() ?? "null"}
            onValueChange={(value) =>
              updateFields({
                oku_status: value === "true" ? true : value === "false" ? false : null,
              })
            }
          >
            <div className="flex items-center space-x-4">
              <RadioGroupItem value="true" id="oku_yes" />
              <Label htmlFor="oku_yes">Yes</Label>
              <RadioGroupItem value="false" id="oku_no" />
              <Label htmlFor="oku_no">No</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </>
  );
}