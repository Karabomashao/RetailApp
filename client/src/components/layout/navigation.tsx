import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChartLine, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Navigation() {
  const { user, logout } = useAuth();

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "U";
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  const getFullName = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "User";
    return `${firstName || ""} ${lastName || ""}`.trim();
  };

  return (
    <nav className="bg-primary shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <ChartLine className="text-white text-2xl" />
            <h1 className="text-white text-xl font-bold">RetailPulse IQ</h1>
            <span className="text-blue-200 text-sm">by LeanTechnovations</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-white hidden sm:block">
              {getFullName(user?.firstName, user?.lastName)}
            </span>
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-gray-300 text-gray-700 text-sm">
                {getInitials(user?.firstName, user?.lastName)}
              </AvatarFallback>
            </Avatar>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-white hover:text-blue-200 hover:bg-white/10"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:ml-2 sm:block">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
