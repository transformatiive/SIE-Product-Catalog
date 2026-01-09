import { Search, List, Plus, Package, BarChart3, Settings, ChevronRight, Cog } from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

type ViewMode = 'list' | 'search' | 'detail' | 'form' | 'create';

interface AppSidebarProps {
  currentView: string;
  onNavigate: (view: ViewMode) => void;
  productCount: number;
}

export function AppSidebar({ currentView, onNavigate, productCount }: AppSidebarProps) {
  const navigationItems = [
    {
      title: "Pesquisa Avançada",
      url: "search",
      icon: Search,
      description: "Pesquisar produtos por critérios",
      priority: "high",
    },
    {
      title: "Lista de Produtos",
      url: "list", 
      icon: List,
      description: `Ver todos`,
      badge: productCount,
      priority: "high",
    },
    {
      title: "Novo Produto",
      url: "create",
      icon: Plus,
      description: "Adicionar novo produto",
      priority: "medium",
    },
  ];

  const analyticsItems = [
    {
      title: "Relatórios",
      description: "Em breve",
      icon: BarChart3,
      disabled: true,
      status: "development",
    },
  ];

  const systemItems = [
    {
      title: "Administração",
      description: "Gestão de opções",
      icon: Settings,
      url: "/admin",
      disabled: false,
    },
    {
      title: "Definições",
      description: "Configuração",
      icon: Cog,
      disabled: true,
      status: "maintenance",
    },
  ];

  const handleNavigation = (view: string) => {
    console.log('Navigate to:', view);
    onNavigate(view as ViewMode);
  };

  return (
    <Sidebar className="border-r border-sidebar-border/50 bg-gradient-to-b from-sidebar via-sidebar to-sidebar/95">
      <SidebarHeader className="p-6 border-b border-sidebar-border/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm">
            <Package className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-sm font-semibold text-sidebar-foreground">Base de Dados de Produtos</h2>
            <p className="text-xs text-muted-foreground">Sistema de Gestão</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4 space-y-8">
        {/* Primary Navigation Section */}
        <SidebarGroup className="space-y-4">
          <SidebarGroupLabel className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary/60"></div>
              NAVEGAÇÃO
            </div>
            <div className="w-12 h-px bg-gradient-to-r from-border to-transparent"></div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    onClick={() => handleNavigation(item.url)}
                    isActive={currentView === item.url}
                    data-testid={`nav-${item.url}`}
                    className={`
                      group h-12 px-4 rounded-lg transition-all duration-200 relative overflow-hidden
                      ${currentView === item.url 
                        ? 'bg-gradient-to-r from-primary/15 via-primary/10 to-primary/5 border border-primary/20 text-primary shadow-sm' 
                        : 'hover-elevate border border-transparent hover:border-sidebar-border/30 hover:shadow-sm'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3 w-full overflow-hidden">
                      <div className={`
                        w-8 h-8 rounded-md flex items-center justify-center transition-all duration-200 flex-shrink-0
                        ${currentView === item.url 
                          ? 'bg-primary/20 text-primary' 
                          : 'bg-muted/50 text-muted-foreground group-hover:bg-muted group-hover:text-foreground'
                        }
                      `}>
                        <item.icon className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`
                            text-sm font-medium transition-colors truncate
                            ${currentView === item.url ? 'text-primary' : 'text-foreground'}
                          `}>
                            {item.title}
                          </span>
                          {item.badge && (
                            <Badge 
                              variant={currentView === item.url ? "default" : "secondary"} 
                              className="h-5 text-xs px-2 flex-shrink-0"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground text-left truncate">
                          {item.description}
                        </span>
                      </div>
                      {currentView === item.url && (
                        <ChevronRight className="w-3 h-3 text-primary/60" />
                      )}
                    </div>
                    {currentView === item.url && (
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent pointer-events-none"></div>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="bg-gradient-to-r from-transparent via-border to-transparent" />

        {/* Analytics Section */}
        <SidebarGroup className="space-y-4">
          <SidebarGroupLabel className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-chart-2/60"></div>
              ANÁLISES
            </div>
            <div className="w-12 h-px bg-gradient-to-r from-border to-transparent"></div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {analyticsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    disabled={item.disabled}
                    className="group h-12 px-4 rounded-lg border border-transparent opacity-60 cursor-not-allowed"
                  >
                    <div className="flex items-center gap-4 w-full">
                      <div className="w-8 h-8 rounded-md bg-muted/30 flex items-center justify-center">
                        <item.icon className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">
                            {item.title}
                          </span>
                          <Badge variant="outline" className="h-5 text-xs px-2 ml-2 border-warning/30 text-warning">
                            Beta
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground/60 text-left">
                          {item.description}
                        </span>
                      </div>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="bg-gradient-to-r from-transparent via-border to-transparent" />

        {/* System Section */}
        <SidebarGroup className="space-y-4">
          <SidebarGroupLabel className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-muted-foreground/40"></div>
              SISTEMA
            </div>
            <div className="w-12 h-px bg-gradient-to-r from-border to-transparent"></div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {systemItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.disabled ? (
                    <SidebarMenuButton 
                      disabled
                      className="group h-12 px-4 rounded-lg border border-transparent opacity-60 cursor-not-allowed"
                    >
                      <div className="flex items-center gap-4 w-full">
                        <div className="w-8 h-8 rounded-md bg-muted/30 flex items-center justify-center">
                          <item.icon className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">
                              {item.title}
                            </span>
                            <Badge variant="outline" className="h-5 text-xs px-2 ml-2 border-muted-foreground/30 text-muted-foreground">
                              Em breve
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground/60 text-left">
                            {item.description}
                          </span>
                        </div>
                      </div>
                    </SidebarMenuButton>
                  ) : (
                    <SidebarMenuButton 
                      asChild
                      isActive={currentView === 'admin'}
                      className={`
                        group h-12 px-4 rounded-lg transition-all duration-200 relative overflow-hidden
                        ${currentView === 'admin' 
                          ? 'bg-gradient-to-r from-primary/15 via-primary/10 to-primary/5 border border-primary/20 text-primary shadow-sm' 
                          : 'hover-elevate border border-transparent hover:border-sidebar-border/30 hover:shadow-sm'
                        }
                      `}
                    >
                      <Link href={item.url!}>
                        <div className="flex items-center gap-3 w-full overflow-hidden">
                          <div className={`
                            w-8 h-8 rounded-md flex items-center justify-center transition-all duration-200 flex-shrink-0
                            ${currentView === 'admin' 
                              ? 'bg-primary/20 text-primary' 
                              : 'bg-muted/50 text-muted-foreground group-hover:bg-muted group-hover:text-foreground'
                            }
                          `}>
                            <item.icon className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col flex-1 min-w-0">
                            <span className={`
                              text-sm font-medium transition-colors truncate
                              ${currentView === 'admin' ? 'text-primary' : 'text-foreground'}
                            `}>
                              {item.title}
                            </span>
                            <span className="text-xs text-muted-foreground text-left truncate">
                              {item.description}
                            </span>
                          </div>
                          {currentView === 'admin' && (
                            <ChevronRight className="w-3 h-3 text-primary/60" />
                          )}
                        </div>
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}