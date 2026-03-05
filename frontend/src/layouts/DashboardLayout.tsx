import { ReactNode } from "react";
import SidebarEstudiante from "./SidebarEstudiante";

interface Props {
  children: ReactNode;
}

const DashboardLayout = ({ children }: Props) => {
  return (
    <div className="flex bg-gray-100 min-h-screen">
      <SidebarEstudiante />
      <div className="flex-1 p-8">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
