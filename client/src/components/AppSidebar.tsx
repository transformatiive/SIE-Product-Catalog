import { Search, List, Plus, Package, BarChart3, Settings } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

type ViewMode = 'list' | 'search' | 'detail' | 'form' | 'create';

interface AppSidebarProps {
  currentView: string;
  onNavigate: (view: ViewMode) => void;
  productCount: number;
}

export function AppSidebar({ currentView, onNavigate, productCount }: AppSidebarProps) {
  const navigationItems = [
    {
      title: "Advanced Search",
      url: "search",
      icon: Search,
      description: "Search products by criteria",
    },
    {
      title: "Product List",
      url: "list", 
      icon: List,
      description: `View all products (${productCount})`,
    },
    {
      title: "Create Product",
      url: "create",
      icon: Plus,
      description: "Add new product",
    },
  ];

  const handleNavigation = (view: string) => {
    console.log('Navigate to:', view);
    onNavigate(view as ViewMode);
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Product Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    onClick={() => handleNavigation(item.url)}
                    isActive={currentView === item.url}
                    data-testid={`nav-${item.url}`}
                  >
                    <item.icon className="w-4 h-4" />
                    <div className="flex flex-col items-start">
                      <span>{item.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {item.description}
                      </span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton disabled>
                  <BarChart3 className="w-4 h-4" />
                  <div className="flex flex-col items-start">
                    <span>Reports</span>
                    <span className="text-xs text-muted-foreground">
                      Coming soon
                    </span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            System
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton disabled>
                  <Settings className="w-4 h-4" />
                  <div className="flex flex-col items-start">
                    <span>Settings</span>
                    <span className="text-xs text-muted-foreground">
                      Configuration
                    </span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}