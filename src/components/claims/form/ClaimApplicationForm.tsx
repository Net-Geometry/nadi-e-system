import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DialogTitle } from "@/components/ui/dialog";

type ClaimData = {
  tp_dusp_id: string;
  dusp_name: string;
  tp_name: string;
  phase_id?: string;
  refid_mcmc: string;
  year: string;
  quarter: string;
  month: string | number;
  ref_no: string;
};

type ClaimApplicationFormProps = ClaimData & {
  updateFields: (fields: Partial<ClaimData>) => void;
  phases: { id: string; name: string }[];
};

function getQuarterFromMonth(month: number): number {
  if ([1, 2, 3].includes(month)) return 1;
  if ([4, 5, 6].includes(month)) return 2;
  if ([7, 8, 9].includes(month)) return 3;
  if ([10, 11, 12].includes(month)) return 4;
  return 0; // Return 0 if the month is invalid
}

export function ClaimApplicationForm({
  tp_dusp_id,
  dusp_name,
  tp_name,
  phase_id,
  refid_mcmc,
  year,
  quarter,
  month,
  ref_no,
  updateFields,
  phases,

}: ClaimApplicationFormProps) {
  const generatedRefNo = `${dusp_name?.toUpperCase() || ""}-${tp_name?.toUpperCase() || ""}-${year || ""}-${quarter ? `Q${quarter}` : ""}-${month ? new Date(0, month - 1).toLocaleString("en-US", { month: "short" }).toUpperCase() : ""}`;
  if (ref_no !== generatedRefNo) {
    updateFields({ ref_no: generatedRefNo });
  }
  return (
    <>
      <DialogTitle className="mb-4">Claim Application</DialogTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Organization */}
        <div className="space-y-2">

          <Label className="flex items-center">
            Organization <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            required
            type="text"
            name="tp_dusp_id"
            value={tp_dusp_id || ""}
            onChange={(e) => updateFields({ tp_dusp_id: e.target.value })}
            disabled
          />
        </div>
        {/* DUSP ID */}
        <div className="space-y-2">
          <Label className="flex items-center">DUSP</Label>
          <Input
            type="text"
            name="dusp_name"
            value={dusp_name || ""}
            onChange={(e) => updateFields({ dusp_name: e.target.value })}
            disabled
          />
        </div>
        {/* TP ID */}
        <div className="space-y-2">
          <Label className="flex items-center">TP</Label>
          <Input
            type="text"
            name="tp_name"
            value={tp_name || ""}
            onChange={(e) => updateFields({ tp_name: e.target.value })}
            disabled
          />
        </div>

        {/* phases */}
        <div className="space-y-2">
          <Label className="flex items-center">Phases<span className="text-red-500 ml-1">*</span></Label>
          <Select
            value={phase_id || ""}
            onValueChange={(value) => updateFields({ phase_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select phase" />
            </SelectTrigger>
            <SelectContent>
              {phases.map((phase) => (
                <SelectItem key={phase.id} value={phase.id.toString()}>
                  {phase.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Ref ID MCMC */}
        {/* <div className="space-y-2">
          <Label className="flex items-center">
            Ref ID MCMC
          </Label>
          <Input
            type="text"
            name="refid_mcmc"
            value={refid_mcmc}
            onChange={(e) => updateFields({ refid_mcmc: e.target.value })}
          />
        </div> */}


        {/* Year */}
        <div className="space-y-2">
          <Label className="flex items-center">Year</Label>
          <Input
            type="text"
            name="year"
            value={year}
            onChange={(e) => updateFields({ year: e.target.value })}
            maxLength={4}
          />
        </div>


        {/* Month */}
        <div className="space-y-2">
          <Label className="flex items-center">Month</Label>
          <Select
            value={month?.toString() ?? ""}
            onValueChange={(value) => {
              const numericMonth = parseInt(value, 10);
              updateFields({
                month: numericMonth, // Store numeric month value
                quarter: getQuarterFromMonth(numericMonth).toString(), // Automatically update quarter
              });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">January</SelectItem>
              <SelectItem value="2">February</SelectItem>
              <SelectItem value="3">March</SelectItem>
              <SelectItem value="4">April</SelectItem>
              <SelectItem value="5">May</SelectItem>
              <SelectItem value="6">June</SelectItem>
              <SelectItem value="7">July</SelectItem>
              <SelectItem value="8">August</SelectItem>
              <SelectItem value="9">September</SelectItem>
              <SelectItem value="10">October</SelectItem>
              <SelectItem value="11">November</SelectItem>
              <SelectItem value="12">December</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Quarter */}
        <div className="space-y-2">
          <Label className="flex items-center">Quarter</Label>
          <Input
            type="text"
            name="quarter"
            value={quarter ? `Q${quarter}` : ""} // Display as Q1, Q2, etc.
            disabled // Make Quarter field non-editable
          />
        </div>


        {/* Reference No */}
        <div className="space-y-2">
          <Label className="flex items-center">Reference No</Label>
          <Input
            type="text"
            name="ref_no"
            value={generatedRefNo} // Dynamically generated ref_no
            disabled // Make Reference No field non-editable
          />
        </div>

      </div>
    </>
  );
}