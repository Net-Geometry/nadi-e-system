import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useUserMetadata } from "@/hooks/use-user-metadata";
import {
  Info,
  GraduationCap,
  BookOpen,
  Book,
  BookUser,
  CheckCircle,
  Clock,
  AlertTriangle,
  Calendar,
  Award,
  UserPlus,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const userTrainingModules = [
  {
    id: 1,
    name: "Workplace Safety",
    due: "2025-05-15",
    completed: "2025-03-01",
    status: "Completed",
    description:
      "Essential safety protocols and procedures for the workplace environment.",
    duration: "2 hours",
    icon: BookOpen,
    progress: 100,
    type: "Mandatory",
  },
  {
    id: 2,
    name: "Data Handling & Privacy",
    due: "2025-06-01",
    completed: null,
    status: "Not completed",
    description:
      "Guidelines for secure data management and privacy compliance regulations.",
    duration: "1.5 hours",
    icon: Book,
    progress: 32,
    type: "Mandatory",
  },
  {
    id: 3,
    name: "Code of Conduct",
    due: "2025-05-01",
    completed: null,
    status: "Not completed",
    description:
      "Organizational ethics, values, and expected behavior in professional settings.",
    duration: "1 hour",
    icon: BookUser,
    progress: 10,
    type: "Mandatory",
  },
  {
    id: 4,
    name: "Leadership Skills",
    due: "2025-07-30",
    completed: null,
    status: "Not completed",
    description:
      "Advanced techniques for effective team management and leadership development.",
    duration: "3 hours",
    icon: Award,
    progress: 45,
    type: "Elective",
  },
  {
    id: 5,
    name: "Time Management",
    due: "2025-08-15",
    completed: null,
    status: "Not completed",
    description:
      "Strategies for optimizing productivity and balancing workload efficiently.",
    duration: "1 hour",
    icon: Clock,
    progress: 0,
    type: "Elective",
  },
];

// Calculate statistics
const stats = {
  total: userTrainingModules.length,
  completed: userTrainingModules.filter((t) => t.status === "Completed").length,
  // Added not completed (Replaced pending and overdue)
  notCompleted: userTrainingModules.filter((t) => t.status !== "Completed")
    .length,
  // Additional stats
  mandatory: userTrainingModules.filter((t) => t.type === "Mandatory").length,
  mandatoryCompleted: userTrainingModules.filter(
    (t) => t.type === "Mandatory" && t.status === "Completed"
  ).length,
  elective: userTrainingModules.filter((t) => t.type === "Elective").length,
  electiveCompleted: userTrainingModules.filter(
    (t) => t.type === "Elective" && t.status === "Completed"
  ).length,
  // Overall completion percentage
  overallCompletion: Math.round(
    (userTrainingModules.filter((t) => t.status === "Completed").length /
      userTrainingModules.length) *
      100
  ),
  // Mandatory completion percentage
  mandatoryCompletion: Math.round(
    (userTrainingModules.filter(
      (t) => t.type === "Mandatory" && t.status === "Completed"
    ).length /
      userTrainingModules.filter((t) => t.type === "Mandatory").length) *
      100
  ),
};
const upcomingTrainings = [
  {
    id: 1,
    name: "Project Management Basics",
    date: "2025-05-20",
    type: "Webinar",
  },
  {
    id: 2,
    name: "New HR Systems Introduction",
    date: "2025-06-10",
    type: "In-person",
  },
];
const StaffTraining = () => {
  const [selectedTab, setSelectedTab] = useState("all");
  const handleStartTraining = (moduleId: number, moduleName: string) => {
    toast({
      title: `Starting ${moduleName}`,
      description: "Loading training module content...",
      duration: 2000,
    });
  };

  // Removed handleContinueTraining function since we're removing the button

  const handleJoinNewTraining = () => {
    toast({
      title: "Joining New Training",
      description: "Searching for available training sessions...",
      duration: 2000,
    });
  };
  const handleViewAllSessions = () => {
    toast({
      title: "Checking for available sessions...",
      description: "Loading all available training sessions",
      duration: 2000,
    });
  };
  const handleViewCertificate = (moduleName: string) => {
    toast({
      title: "Certificate downloaded",
      description: `${moduleName} completion certificate`,
      duration: 2000,
    });
  };
  const handleOpenFAQ = () => {
    toast({
      title: "Opening FAQ...",
      description: "Loading training frequently asked questions",
      duration: 2000,
    });
  };

  // Update filtered modules to use new tabs and statuses
  const filteredModules =
    selectedTab === "all"
      ? userTrainingModules
      : selectedTab === "completed"
      ? userTrainingModules.filter((m) => m.status === "Completed")
      : userTrainingModules.filter((m) => m.status === "Not completed");
  return (
    <DashboardLayout>
      <div>
        <Card className="relative overflow-hidden animate-fade-in shadow">
          <div
            className="absolute inset-0 pointer-events-none opacity-10 z-0"
            style={{
              background: "linear-gradient(120deg,#f5f3ff 40%,#dbeafe 100%)",
            }}
          />
          <CardHeader className="flex flex-row items-center justify-between gap-2 z-10">
            <div className="flex items-center gap-2">
              <span
                className="rounded-full bg-[#5147dd]/10 p-2 animate-scale-in"
                title="Training Icon"
              >
                <GraduationCap className="text-[#5147dd]" />
              </span>
              <CardTitle>Training Portal</CardTitle>
              <span
                className="ml-1"
                title="Your personal training and learning center"
              >
                <span
                  title="Your personal training and learning center"
                  aria-label="Your personal training and learning center"
                >
                  <Info className="w-4 h-4 text-gray-400 cursor-help" />
                </span>
              </span>
            </div>
            <Button
              className="bg-[#5147dd] hover:bg-[#4137cd] text-white flex items-center gap-2"
              onClick={handleJoinNewTraining}
            >
              <UserPlus size={18} />
              Join New Training
            </Button>
          </CardHeader>
          <CardContent className="z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-[5px]">
              <div className="bg-[#5147dd]/5 rounded-lg p-4 py-0 mx-0 my-0 px-[30px]">
                <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#5147dd]" />
                  Upcoming Trainings
                </h3>
                {upcomingTrainings.length > 0 ? (
                  <ul className="space-y-3">
                    {upcomingTrainings.map((training) => (
                      <li
                        key={training.id}
                        className="flex justify-between items-center text-sm border-b pb-2"
                      >
                        <div>
                          <p className="font-medium">{training.name}</p>
                          <p className="text-xs text-gray-500">
                            {training.date} • {training.type}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-[#5147dd]/10 text-[#5147dd] border-[#5147dd]/20"
                        >
                          Scheduled
                        </Badge>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">
                    No upcoming trainings scheduled.
                  </p>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 text-[#5147dd]"
                  onClick={handleViewAllSessions}
                >
                  View All Sessions
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Training Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="flex flex-col items-center justify-center py-5 animate-fade-in">
            <span className="rounded-full bg-[#5147dd]/10 p-2 mb-2">
              <BookOpen className="text-[#5147dd]" />
            </span>
            <span className="text-lg font-bold text-[#5147dd]">
              {stats.total}
            </span>
            <span className="text-xs text-muted-foreground">Total Modules</span>
          </Card>
          <Card className="flex flex-col items-center justify-center py-5 animate-fade-in">
            <span className="rounded-full bg-green-100 p-2 mb-2">
              <CheckCircle className="text-green-600" />
            </span>
            <span className="text-lg font-bold text-green-600">
              {stats.completed}
            </span>
            <span className="text-xs text-muted-foreground">Completed</span>
          </Card>
          <Card className="flex flex-col items-center justify-center py-5 animate-fade-in">
            <span className="rounded-full bg-amber-100 p-2 mb-2">
              <Clock className="text-amber-600" />
            </span>
            <span className="text-lg font-bold text-amber-600">
              {stats.notCompleted}
            </span>
            <span className="text-xs text-muted-foreground">Not Completed</span>
          </Card>
        </div>

        {/* Training Modules */}
        <Card className="animate-fade-in shadow">
          <CardHeader>
            <CardTitle>
              Your Training Modules
              <span
                title="See your required and completed training modules"
                aria-label="See your required and completed training modules"
                className="inline-block ml-1"
              >
                <Info className="inline w-4 h-4 text-gray-400 cursor-help" />
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs
              defaultValue="all"
              value={selectedTab}
              onValueChange={setSelectedTab}
              className="mb-6"
            >
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="not completed">Not completed</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredModules.map((module) => (
                <Card key={module.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full p-2 ${
                            module.status === "Completed"
                              ? "bg-green-100"
                              : "bg-amber-100"
                          }`}
                        >
                          <module.icon
                            className={`w-4 h-4 ${
                              module.status === "Completed"
                                ? "text-green-600"
                                : "text-amber-600"
                            }`}
                          />
                        </span>
                        <CardTitle className="text-base">
                          {module.name}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-xs text-gray-500 mb-4">
                      {module.description}
                    </p>
                    <div className="flex justify-between text-xs mb-2">
                      <span>Duration: {module.duration}</span>
                      <span
                        className={`font-medium ${
                          module.status === "Completed"
                            ? "text-green-600"
                            : "text-amber-600"
                        }`}
                      >
                        {module.status}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 text-xs">
                      <div className="flex justify-between">
                        <span className="font-medium">Training Date:</span>
                        <span>{module.due}</span>
                      </div>
                      {module.status === "Completed" && (
                        <div className="flex justify-between">
                          <span className="font-medium">Complete Date:</span>
                          <span className="text-green-600">
                            {module.completed}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    {module.status === "Completed" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleViewCertificate(module.name)}
                      >
                        View Certificate
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>

            {filteredModules.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                No training modules match your filter.
              </div>
            )}
          </CardContent>
        </Card>

        {/* How to Complete Your Training */}
        <Card className="shadow animate-fade-in">
          <CardHeader>
            <CardTitle>How to Complete Your Training</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal pl-6 text-sm space-y-2">
              <li>
                <strong>Review Assigned Modules:</strong> Check which trainings
                are pending or overdue above.
              </li>
              <li>
                <strong>Start or Continue a Module:</strong> Click on the
                respective button to begin or resume your training.
              </li>
              <li>
                <strong>Complete All Materials:</strong> Watch all required
                videos, read all content, and complete any quizzes.
              </li>
              <li>
                <strong>Take Assessment:</strong> Most modules end with a short
                quiz to test your knowledge.
              </li>
              <li>
                <strong>Get Certified:</strong> Upon successful completion,
                you'll receive a certificate and your progress will be updated.
              </li>
            </ol>
            <div className="mt-4 flex flex-col gap-2 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-700">Training Resources</h4>
              <p className="text-xs text-blue-600">
                Need help with your training? Contact the L&D team at{" "}
                <span className="font-medium">learning@example.com</span> or
                check the
                <Button
                  variant="link"
                  className="h-auto p-0 text-xs"
                  onClick={handleOpenFAQ}
                >
                  Training FAQ
                </Button>
                .
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};
export default StaffTraining;
