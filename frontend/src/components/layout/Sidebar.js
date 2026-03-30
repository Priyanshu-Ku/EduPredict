import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Info,
  BookOpen,
  Home,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
} from "lucide-react";
import clsx from "clsx";

const navItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/predict", label: "Predict", icon: FileText },
  { path: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { path: "/model-info", label: "Model Info", icon: Info },
  { path: "/about", label: "About", icon: BookOpen },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={clsx(
        "fixed left-0 top-0 h-screen bg-sidebar-bg text-white transition-all duration-300 z-50",
        collapsed ? "w-20" : "w-64",
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-700">
        <div
          className={clsx(
            "flex items-center gap-3",
            collapsed && "justify-center w-full",
          )}
        >
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="font-bold text-lg">EduPredict</h1>
              <p className="text-xs text-slate-400">ML Analytics</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-6 px-3">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={clsx(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                    isActive
                      ? "bg-primary-600 text-white shadow-lg shadow-primary-600/30"
                      : "text-slate-300 hover:bg-sidebar-hover hover:text-white",
                    collapsed && "justify-center px-2",
                  )}
                >
                  <Icon
                    className={clsx(
                      "w-5 h-5 flex-shrink-0",
                      isActive && "animate-pulse-slow",
                    )}
                  />
                  {!collapsed && (
                    <span className="font-medium animate-slide-in">
                      {item.label}
                    </span>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-sidebar-hover hover:bg-slate-600 flex items-center justify-center transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-5 h-5" />
        ) : (
          <ChevronLeft className="w-5 h-5" />
        )}
      </button>
    </aside>
  );
};

export default Sidebar;
