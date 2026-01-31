import {
  BarChart3,
  Receipt,
  PieChart,
  CreditCard,
  Globe,
  Zap,
  CircleAlert,
  TriangleAlert,
} from "lucide-react";

// Stats Data
export const statsData = [
  {
    value: "5K+",
    label: "Active Users",
  },
  {
    value: "₹10 lakh +",
    label: "Transactions Tracked",
  },
  {
    value: "96.9%",
    label: "Uptime",
  },
  {
    value: "3.7 /5",
    label: "User Rating",
  },
];

// Features Data
export const featuresData = [
  {
    icon: <BarChart3 className="h-8 w-8 text-blue-600" />,
    title: "Advanced Analytics",
    description:
      "Get detailed insights into your spending patterns our analytics system",
  },
  {
    icon: <Receipt className="h-8 w-8 text-blue-600" />,
    title: "Tracking your capital & revenue expenditure",
    description:
      "Keep a track of both kind of expenses with our advanced tech",
  },
  {
    icon: <PieChart className="h-8 w-8 text-blue-600" />,
    title: "Budget Planning",
    description: "Create and manage budgets with intelligent recommendations",
  },
  {
    icon: <CreditCard className="h-8 w-8 text-blue-600" />,
    title: "Multi-Account Support",
    description: "Manage multiple accounts and credit cards in one place",
  },
  {
    icon: <TriangleAlert className="h-8 w-8 text-blue-600" />,
    title: "Budget-Alert",
    description: "Get automated alerts when you're about to exceed your budget for a particular month",
  },
  {
    icon: <Zap className="h-8 w-8 text-blue-600" />,
    title: "Automated Insights",
    description: "Get automated financial insights and recommendations",
  },
];

// How It Works Data
export const howItWorksData = [
  {
    icon: <CreditCard className="h-8 w-8 text-blue-600" />,
    title: "1. Create Your Account",
    description:
      "Get started in minutes with our simple and secure sign-up process",
  },
  {
    icon: <BarChart3 className="h-8 w-8 text-blue-600" />,
    title: "2. Track Your Spending",
    description:
      "Automatically categorize and track your transactions in real-time",
  },
  {
    icon: <PieChart className="h-8 w-8 text-blue-600" />,
    title: "3. Get Insights",
    description:
      "Receive insights and recommendations to optimize your finances",
  },
];

// Testimonials Data
export const testimonialsData = [
  {
    name: "Sarah Johnson",
    role: "Financial Analyst",
    image: "https://randomuser.me/api/portraits/women/75.jpg",
    quote:
      "As an Immigrant , Savvy has transformed how I manage my job tasks. The AI insights have helped me identify cost-saving opportunities I never knew existed.",
  },
  {
    name: "Purushotam Agarwal",
    role: "Freelancer",
    image: "https://randomuser.me/api/portraits/men/65.jpg",
    quote:
      "The receipt scanning feature saves me hours each month. Now I can focus on my work instead of manual data entry and expense tracking.",
  },
  {
    name: "Saksham Gupta",
    role: "Small Business Owner",
    image: "https://randomuser.me/api/portraits/men/39.jpg",
    quote:
      "The budget alert feature and interactive dashboards help me to keep a track of my business expenses. Monthly automated insights assisted me to identify cost-saving opportunities.",
  },
];