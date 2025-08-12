import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  Home,
  Database,
  ShoppingCart,
  Package,
  BarChart3,
  TrendingUp,
  Calculator,
  GraduationCap,
} from "lucide-react";

const navigationItems = [
  {
    href: "/",
    label: "Home",
    icon: Home,
  },
  {
    label: "Data Entry",
    icon: Database,
    children: [
      {
        href: "/sales",
        label: "Sales",
        icon: ShoppingCart,
      },
      {
        href: "/inventory",
        label: "Inventory",
        icon: Package,
      },
    ],
  },
  {
    label: "Dashboards",
    icon: BarChart3,
    children: [
      {
        href: "/sales-dashboard",
        label: "Sales Analytics",
        icon: TrendingUp,
      },
      {
        href: "/inventory-dashboard",
        label: "Inventory Analytics",
        icon: Package,
      },
    ],
  },
  {
    href: "/retail-maths",
    label: "Retail Maths",
    icon: Calculator,
  },
  {
    href: "/retail-university",
    label: "Retail University",
    icon: GraduationCap,
  },
];

export default function Sidebar() {
  const [location] = useLocation();

  const isActiveLink = (href: string) => {
    if (href === "/") {
      return location === "/";
    }
    return location.startsWith(href);
  };

  return (
    <aside className="w-64 bg-white shadow-lg min-h-screen">
      <div className="p-4">
        <nav className="space-y-2">
          {navigationItems.map((item, index) => {
            const Icon = item.icon;
            
            if (item.href) {
              // Direct link item
              return (
                <Link key={index} href={item.href}>
                  <a
                    className={cn(
                      "nav-link",
                      isActiveLink(item.href) && "active"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </a>
                </Link>
              );
            }

            // Parent item with children
            return (
              <div key={index} className="space-y-1">
                <div className="flex items-center space-x-3 px-4 py-3 text-text-primary font-medium">
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </div>
                {item.children && (
                  <div className="space-y-1">
                    {item.children.map((child, childIndex) => {
                      const ChildIcon = child.icon;
                      return (
                        <Link key={childIndex} href={child.href}>
                          <a
                            className={cn(
                              "flex items-center space-x-3 px-8 py-2 text-text-secondary hover:bg-gray-100 rounded-lg transition-colors",
                              isActiveLink(child.href) && "bg-primary text-white hover:bg-primary/90"
                            )}
                          >
                            <ChildIcon className="w-4 h-4" />
                            <span>{child.label}</span>
                          </a>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
