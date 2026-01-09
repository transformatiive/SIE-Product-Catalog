import { Search, List, Plus, BarChart3, Settings, Cog } from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import sieLogo from "@assets/sie-logo.svg";

type ViewMode = 'list' | 'search' | 'detail' | 'form' | 'create';

interface AppSidebarProps {
  currentView: string;
  onNavigate: (view: ViewMode) => void;
  productCount: number;
}

export function AppSidebar({ currentView, onNavigate, productCount }: AppSidebarProps) {
  const [location, setLocation] = useLocation();
  const isOnAdminPage = location === "/admin";
  const navigationItems = [
    {
      title: "Pesquisa",
      url: "search",
      icon: Search,
    },
    {
      title: "Produtos",
      url: "list", 
      icon: List,
      badge: productCount,
    },
    {
      title: "Novo",
      url: "create",
      icon: Plus,
    },
  ];

  const systemItems = [
    {
      title: "Admin",
      icon: Settings,
      url: "/admin",
      disabled: false,
    },
    {
      title: "Config",
      icon: Cog,
      disabled: true,
    },
  ];

  const handleNavigation = (view: string) => {
    if (isOnAdminPage) {
      setLocation("/");
      setTimeout(() => onNavigate(view as ViewMode), 50);
    } else {
      onNavigate(view as ViewMode);
    }
  };

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-center">
          <img 
            src={sieLogo} 
            alt="SIE - Sociedade Internacional de Embalagens" 
            className="h-8 w-auto"
          />
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    onClick={() => handleNavigation(item.url)}
                    isActive={currentView === item.url}
                    data-testid={`nav-${item.url}`}
                    className={`
                      h-10 px-3 rounded-md transition-all duration-150
                      ${currentView === item.url 
                        ? 'bg-primary/10 text-primary font-medium' 
                        : 'hover:bg-muted text-foreground'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <item.icon className={`w-4 h-4 flex-shrink-0 ${currentView === item.url ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className="text-sm truncate">{item.title}</span>
                      {item.badge !== undefined && (
                        <Badge 
                          variant={currentView === item.url ? "default" : "secondary"} 
                          className="h-5 text-xs px-1.5 ml-auto"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-3" />

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {systemItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.disabled ? (
                    <SidebarMenuButton 
                      disabled
                      className="h-10 px-3 rounded-md opacity-50 cursor-not-allowed"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <item.icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm text-muted-foreground truncate">{item.title}</span>
                      </div>
                    </SidebarMenuButton>
                  ) : (
                    <SidebarMenuButton 
                      asChild
                      isActive={currentView === 'admin'}
                      className={`
                        h-10 px-3 rounded-md transition-all duration-150
                        ${currentView === 'admin' 
                          ? 'bg-primary/10 text-primary font-medium' 
                          : 'hover:bg-muted text-foreground'
                        }
                      `}
                    >
                      <Link href={item.url!}>
                        <div className="flex items-center gap-3 w-full">
                          <item.icon className={`w-4 h-4 flex-shrink-0 ${currentView === 'admin' ? 'text-primary' : 'text-muted-foreground'}`} />
                          <span className="text-sm truncate">{item.title}</span>
                        </div>
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-3" />

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  disabled
                  className="h-10 px-3 rounded-md opacity-50 cursor-not-allowed"
                >
                  <div className="flex items-center gap-3 w-full">
                    <BarChart3 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm text-muted-foreground truncate">Relatórios</span>
                    <Badge variant="outline" className="h-4 text-[10px] px-1 ml-auto">
                      Beta
                    </Badge>
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
