"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface AdvertiserData {
  id: number;
  name: string;
  login: string;
  password: string | null;
  password_repeat: string | null;
  password_current?: string | null;
  password_stats?: string | null;
  email: string;
  phone?: string | null;
  address_apt: string | null;
  address_city: string | null;
  address_state: string | null;
  address_street: string | null;
  address_zip: string | null;
  address_country: string;
  balance: number;
  remain_balance: number;
  spend_yesterday: number;
  total_spend: number;
  notify_daily_spend: boolean;
  hide_notifications: boolean;
  ui_theme: string;
  company?: string | null;
  website?: string | null;
  days_left?: number | null;
  feed_blacklist?: string | null;
  other_contacts?: string | null;
  tax_id?: string | null;
  rtb_name?: string | null;
  rtb_agency_name?: string | null;
  skype_id?: string | null;
}

interface PublisherData {
  id: number;
  name: string;
  timestamp: string;
  email: string;
  website: string;
  address_apt: string;
  address_city: string;
  address_country: string;
  address_state: string;
  address_street: string;
  address_zip: string;
  balance: number;
  company: string;
  hide_notifications: boolean;
  login: string;
  other_contacts: string;
  password: string | null;
  password_current: string | null;
  password_repeat: string | null;
  password_stats: string;
  phone: string;
  skype_id: string;
  ui_theme: string;
  website_descr: string;
}

interface AppContext {
  isLogin: boolean;
  token: string | undefined;
  accountType: string | undefined;
  publisherData?: PublisherData;
  advertiserData?: AdvertiserData;
  initializing: boolean;
  login: (token: string, accountType: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AppContext | undefined>(undefined);

interface Props {
  children?: ReactNode;
}

export const AuthProvider = ({ children }: Props) => {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(false);
  const [token, setToken] = useState<string | undefined>();
  const [accountType, setAccountType] = useState<string | undefined>();
  const [publisherData, setPublisherData] = useState<PublisherData>();
  const [advertiserData, setAdvertiserData] = useState<AdvertiserData>();

  const [initializing, setInitializing] = useState(true);

  const fetchData = async (mytoken: string) => {
    try {
      const response = await axios.get(
        `https://panel.adsaro.com/publisher/api/Account?version=4&token=${mytoken}`
      );
      console.log(response.data.response.rows[0]);
      setPublisherData(response.data.response.rows[0]);
      setAdvertiserData(undefined);
    } catch (err) {
      console.log("Error fetching publisher data:", err);
    }
  };
  const fetchAdvertiserData = async (mytoken: string) => {
    try {
      const response = await axios.get(
        `https://panel.adsaro.com/advertiser/api/Account?version=4&token=${mytoken}`
      );
      console.log("Advertiser", response.data.response.rows[0]);
      setAdvertiserData(response.data.response.rows[0]);
      setPublisherData(undefined);
    } catch (err) {
      console.log("Error fetching publisher data:", err);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("session_token");
      const storedAccountType = localStorage.getItem("accountType");

      if (storedToken && storedAccountType) {
        console.log("Token found:", storedToken);
        console.log("Account Type found:", storedAccountType);
        
        setToken(storedToken);
        setAccountType(storedAccountType);
        setIsLogin(true);
        
        // Clear any existing logout notification when user is already logged in
        localStorage.removeItem("logout");
        
        try {
          if (storedAccountType === "Advertiser") {
            await fetchAdvertiserData(storedToken);
          } else if (storedAccountType === "Publisher") {
            await fetchData(storedToken);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          // If fetching data fails, clear the invalid session
          localStorage.removeItem("session_token");
          localStorage.removeItem("accountType");
          setIsLogin(false);
          setToken(undefined);
          setAccountType(undefined);
        }
      }
      
      setInitializing(false);
    };

    initializeAuth();
  }, []);

  const login = (token: string, accountType: string) => {
    console.log("Logging in with account type:", accountType);
    // Clear any existing logout notification
    localStorage.removeItem("logout");
    
    setToken(token);
    setAccountType(accountType);
    localStorage.setItem("session_token", token);
    localStorage.setItem("accountType", accountType);
    setIsLogin(true);

    if (accountType === "Advertiser") {
      fetchAdvertiserData(token);
      // Don't call router.push here - let the component handle navigation
    }
    if (accountType === "Publisher") {
      fetchData(token);
      // Don't call router.push here - let the component handle navigation
    }
  };
  
  const logout = () => {
    const currentAccountType = accountType; // Store before resetting state
    
    // Clear all auth-related data
    localStorage.removeItem("session_token");
    localStorage.removeItem("accountType");
    
    // Reset all state
    setIsLogin(false);
    setToken(undefined);
    setAccountType(undefined);
    setPublisherData(undefined);
    setAdvertiserData(undefined);
    
    // Set logout notification and redirect based on account type
    if (currentAccountType === "Publisher") {
      localStorage.setItem("logout", "Logout successfully!");
      router.push("/publisher/login");
    } else if (currentAccountType === "Advertiser") {
      localStorage.setItem("logout", "Logout successfully!");
      router.push("/advertiser/login");
    } else {
      // Fallback for unknown account type
      router.push("/");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        accountType,
        initializing,
        publisherData,
        advertiserData,
        isLogin,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom Hook to use Auth Context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
