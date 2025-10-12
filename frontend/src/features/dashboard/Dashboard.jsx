import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import {
  TrendingUp,
  TrendingDown,
  Package,
  Truck,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
} from "lucide-react";

const StatCard = ({ title, value, change, icon: Icon, trend = "up" }) => {
  const trendColor = trend === "up" ? "text-green-600" : "text-red-600";
  const TrendIcon = trend === "up" ? TrendingUp : TrendingDown;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {change && (
              <div className={`flex items-center space-x-1 ${trendColor}`}>
                <TrendIcon className="h-4 w-4" />
                <span className="text-sm">{change}</span>
              </div>
            )}
          </div>
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const TileCard = ({ title, count, status, onClick }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "active":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            <p className="text-3xl font-bold text-primary mt-2">{count}</p>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
              status
            )}`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const { user, role } = useSelector((state) => state.auth);
  const { activeTab } = useSelector((state) => state.ui);

  // Mock data - in real app, this would come from API
  const stats = {
    totalIndents: 145,
    activeRFQs: 23,
    ongoingDeliveries: 87,
    completedDeliveries: 234,
  };

  const tiles = [
    { title: "Pending Approvals", count: 12, status: "pending" },
    { title: "Active Contracts", count: 45, status: "active" },
    { title: "In Transit", count: 78, status: "active" },
    { title: "Completed Today", count: 23, status: "completed" },
    { title: "Overdue Items", count: 5, status: "overdue" },
    { title: "Scheduled Pickups", count: 18, status: "pending" },
  ];

  const handleTileClick = (tile) => {
    console.log(`Clicked on ${tile.title}`);
    // Navigate to relevant section based on tile
  };

  const getRoleBasedGreeting = () => {
    const hour = new Date().getHours();
    const timeGreeting =
      hour < 12
        ? "Good morning"
        : hour < 18
        ? "Good afternoon"
        : "Good evening";

    return `${timeGreeting}, ${user?.name || "User"}!`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">{getRoleBasedGreeting()}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Role</p>
          <p className="text-lg font-semibold text-foreground capitalize">
            {role}
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Indents"
          value={stats.totalIndents}
          change="+12% from last month"
          icon={Package}
          trend="up"
        />
        <StatCard
          title="Active RFQs"
          value={stats.activeRFQs}
          change="+5% from last week"
          icon={Clock}
          trend="up"
        />
        <StatCard
          title="Ongoing Deliveries"
          value={stats.ongoingDeliveries}
          change="-2% from yesterday"
          icon={Truck}
          trend="down"
        />
        <StatCard
          title="Completed Deliveries"
          value={stats.completedDeliveries}
          change="+18% from last month"
          icon={CheckCircle}
          trend="up"
        />
      </div>

      {/* Action Tiles */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tiles.map((tile, index) => (
            <TileCard
              key={index}
              title={tile.title}
              count={tile.count}
              status={tile.status}
              onClick={() => handleTileClick(tile)}
            />
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Recent Activity
        </h2>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[
                {
                  action: "New indent created",
                  time: "2 minutes ago",
                  status: "success",
                },
                {
                  action: "RFQ #RF001 closed",
                  time: "15 minutes ago",
                  status: "info",
                },
                {
                  action: "Delivery completed for Contract #CT003",
                  time: "1 hour ago",
                  status: "success",
                },
                {
                  action: "Payment pending for Invoice #INV045",
                  time: "2 hours ago",
                  status: "warning",
                },
                {
                  action: "New transporter registered",
                  time: "3 hours ago",
                  status: "info",
                },
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 py-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      activity.status === "success"
                        ? "bg-green-500"
                        : activity.status === "warning"
                        ? "bg-yellow-500"
                        : "bg-blue-500"
                    }`}
                  />
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
