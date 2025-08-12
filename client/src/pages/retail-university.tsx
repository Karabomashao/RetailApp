import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Clock, 
  Award, 
  CheckCircle, 
  Play, 
  Trophy,
  Target,
  Users,
  TrendingUp,
  Handshake,
  Package,
  Calculator,
  GraduationCap
} from "lucide-react";
import { getAuthHeaders } from "@/lib/authUtils";

interface Lesson {
  id: string;
  title: string;
  category: string;
  content: string;
  contentUrl: string;
  durationMins: number;
  createdAt: string;
}

interface UserProgress {
  id: string;
  lessonId: string;
  status: string;
  progress: number;
  lastViewedAt: string;
  completedAt: string;
}

export default function RetailUniversity() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { data: lessons, isLoading: lessonsLoading } = useQuery<Lesson[]>({
    queryKey: ["/api/lessons"],
    queryFn: async () => {
      const response = await fetch("/api/lessons", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch lessons");
      return response.json();
    },
  });

  const { data: userProgress, isLoading: progressLoading } = useQuery<UserProgress[]>({
    queryKey: ["/api/lessons/progress"],
    queryFn: async () => {
      const response = await fetch("/api/lessons/progress", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch progress");
      return response.json();
    },
  });

  const categories = [
    { id: "sales", name: "Sales Mastery", icon: Handshake, color: "text-primary" },
    { id: "inventory", name: "Inventory Management", icon: Package, color: "text-orange-600" },
    { id: "finance", name: "Financial Management", icon: Calculator, color: "text-green-600" },
    { id: "leadership", name: "Team Management", icon: Users, color: "text-purple-600" },
    { id: "marketing", name: "Marketing & Growth", icon: TrendingUp, color: "text-blue-600" },
  ];

  // Calculate progress statistics
  const completedLessons = userProgress?.filter(p => p.status === "completed").length || 0;
  const inProgressLessons = userProgress?.filter(p => p.status === "in_progress").length || 0;
  const totalLessons = lessons?.length || 0;
  const completionRate = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  // Calculate learning hours
  const totalHours = userProgress?.reduce((sum, progress) => {
    const lesson = lessons?.find(l => l.id === progress.lessonId);
    if (lesson && progress.status === "completed") {
      return sum + lesson.durationMins;
    }
    return sum;
  }, 0) || 0;

  // Mock certificates count
  const certificatesEarned = Math.floor(completedLessons / 3); // 1 certificate per 3 completed lessons

  const getCategoryLessons = (categoryId: string) => {
    if (!lessons) return [];
    return lessons.filter(lesson => 
      selectedCategory === "all" || lesson.category === categoryId
    );
  };

  const getLessonProgress = (lessonId: string) => {
    return userProgress?.find(p => p.lessonId === lessonId);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "in_progress":
        return <Badge className="bg-orange-100 text-orange-800">In Progress</Badge>;
      default:
        return <Badge variant="outline">Not Started</Badge>;
    }
  };

  if (lessonsLoading || progressLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-text-primary">Retail University</h2>
            <p className="text-text-secondary mt-2">Enhance your retail business skills with our comprehensive microlearning courses</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-text-primary">Retail University</h2>
          <p className="text-text-secondary mt-2">Enhance your retail business skills with our comprehensive microlearning courses</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Award className="w-4 h-4 mr-2" />
            My Certificates
          </Button>
          <Button className="btn-primary">
            <GraduationCap className="w-4 h-4 mr-2" />
            Browse Courses
          </Button>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Courses Completed</p>
                <p className="text-2xl font-bold text-text-primary">{completedLessons}</p>
              </div>
              <div className="bg-green-600 bg-opacity-10 p-3 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">In Progress</p>
                <p className="text-2xl font-bold text-text-primary">{inProgressLessons}</p>
              </div>
              <div className="bg-orange-600 bg-opacity-10 p-3 rounded-full">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Learning Hours</p>
                <p className="text-2xl font-bold text-text-primary">{Math.floor(totalHours / 60)}</p>
              </div>
              <div className="bg-primary bg-opacity-10 p-3 rounded-full">
                <Clock className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Certificates</p>
                <p className="text-2xl font-bold text-text-primary">{certificatesEarned}</p>
              </div>
              <div className="bg-purple-600 bg-opacity-10 p-3 rounded-full">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Categories and Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Category Filter */}
          <Card>
            <CardHeader>
              <CardTitle>Course Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory("all")}
                >
                  All Courses
                </Button>
                {categories.map((category) => {
                  const Icon = category.icon;
                  const categoryLessons = getCategoryLessons(category.id);
                  return (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                      className="flex items-center space-x-2"
                    >
                      <Icon className={`w-4 h-4 ${category.color}`} />
                      <span>{category.name}</span>
                      <Badge variant="secondary" className="ml-1">
                        {categoryLessons.length}
                      </Badge>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Courses by Category */}
          {categories.map((category) => {
            if (selectedCategory !== "all" && selectedCategory !== category.id) return null;
            
            const categoryLessons = getCategoryLessons(category.id);
            if (categoryLessons.length === 0) return null;

            const Icon = category.icon;

            return (
              <Card key={category.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <Icon className={`w-5 h-5 ${category.color} mr-2`} />
                      {category.name}
                    </CardTitle>
                    <Badge variant="outline">{categoryLessons.length} courses</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {categoryLessons.map((lesson) => {
                      const progress = getLessonProgress(lesson.id);
                      const isCompleted = progress?.status === "completed";
                      const isInProgress = progress?.status === "in_progress";
                      
                      return (
                        <div key={lesson.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center space-x-4">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                              isCompleted 
                                ? "bg-green-600 bg-opacity-10"
                                : isInProgress 
                                ? "bg-orange-600 bg-opacity-10"
                                : "bg-primary bg-opacity-10"
                            }`}>
                              {isCompleted ? (
                                <CheckCircle className="w-6 h-6 text-green-600" />
                              ) : (
                                <BookOpen className={`w-6 h-6 ${category.color}`} />
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{lesson.title}</h4>
                              <p className="text-xs text-text-secondary">
                                Duration: {lesson.durationMins} min
                              </p>
                              {progress && (
                                <div className="flex items-center mt-2">
                                  <Progress value={progress.progress || 0} className="w-24 h-2 mr-2" />
                                  <span className="text-xs text-green-600">
                                    {progress.progress || 0}% complete
                                  </span>
                                </div>
                              )}
                              <div className="mt-1">
                                {getStatusBadge(progress?.status || "not_started")}
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            {isCompleted ? (
                              <Button size="sm" variant="outline">
                                <Award className="w-4 h-4 mr-1" />
                                Certificate
                              </Button>
                            ) : (
                              <Button size="sm" className="btn-primary">
                                <Play className="w-4 h-4 mr-1" />
                                {isInProgress ? "Continue" : "Start"}
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {lessons && lessons.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600">No Courses Available</h3>
                <p className="text-gray-500 mt-2">Courses will be added soon. Check back later!</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Learning Progress & Recommendations */}
        <div className="space-y-6">
          {/* Current Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Learning Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Overall Completion</span>
                    <span className="text-sm text-green-600">{completionRate.toFixed(0)}%</span>
                  </div>
                  <Progress value={completionRate} className="w-full h-3" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">This Week</span>
                    <span className="text-sm text-primary">{(totalHours % 300)} mins</span>
                  </div>
                  <Progress value={Math.min((totalHours % 300) / 300 * 100, 100)} className="w-full h-2" />
                  <p className="text-xs text-text-secondary mt-1">Goal: 5 hrs/week</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommended Courses */}
          <Card className="ai-insights">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="w-5 h-5 text-accent mr-2" />
                Recommended for You
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="bg-blue-50 border-l-4 border-primary p-3 rounded">
                  <p className="font-medium text-sm">Team Management</p>
                  <p className="text-xs text-gray-600">
                    Based on your business growth, learn to manage retail teams effectively.
                  </p>
                  <Button variant="link" className="text-xs text-primary hover:underline mt-1 p-0">
                    View Course →
                  </Button>
                </div>
                <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded">
                  <p className="font-medium text-sm">Digital Marketing</p>
                  <p className="text-xs text-gray-600">
                    Expand your reach with online marketing strategies for retail businesses.
                  </p>
                  <Button variant="link" className="text-xs text-green-600 hover:underline mt-1 p-0">
                    View Course →
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="w-5 h-5 text-yellow-500 mr-2" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {certificatesEarned > 0 ? (
                  <>
                    <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                      <div className="w-10 h-10 bg-yellow-500 bg-opacity-20 rounded-full flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Learning Champion</p>
                        <p className="text-xs text-text-secondary">Completed {completedLessons} courses</p>
                      </div>
                    </div>
                    {completedLessons >= 5 && (
                      <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                        <div className="w-10 h-10 bg-primary bg-opacity-20 rounded-full flex items-center justify-center">
                          <Award className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Expert Status</p>
                          <p className="text-xs text-text-secondary">Earned {certificatesEarned} certificates</p>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-4">
                    <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Complete your first course to earn achievements!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
