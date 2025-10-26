// import Customer from "./pages/ServiceManger";
import Dashboard from "./pages/dashboard";
// import S_Transaction from "./pages/RentManager";
import Report from "./pages/reports";
import Orders from "./pages/Orders";
import AddUser from "./pages/AddUser";
import MenuManagement from "./pages/MenuManagement";
import OrderList from "./pages/OrderList";
const MainContent = ({ activeComponent }) => {
  const renderContent = () => {
    switch (activeComponent) {
      case "dashboard":
        return <Dashboard />;
      case "MenuManagement":
        return <MenuManagement />;
      case "BlockManager":
        return <BlockManager />;
      case "user managements":
        return <UserManagement />;
      case "report":
        return <Report />;
      case "Salaries":
        return <Salaries />;
      case "setting":
        return <Setting />;
      case "ServiceManager":
        return <ServiceManager />;
      case "Fees":
        return <Fees />;
      case "Orders":
        return <Orders />;
      case "OrdersList":
        return <OrderList />;
      case "AddUser":
        return <AddUser />;

      default:
        return <Dashboard />;
    }
  };

  return <div className="min-h-[90vh]">{renderContent()}</div>;
};

export default MainContent;
