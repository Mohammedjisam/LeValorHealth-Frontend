"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Sun, Moon, Lock, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import authAxiosInstance from "../../services/authAxiosInstance";
import { useTheme } from "../../components/theme-provider";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { addReceptionist } from "../../redux/slice/ReceptionistSlice";


const Login: React.FC = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const dispatch = useDispatch();


const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setIsLoading(true);

  try {
    const res = await authAxiosInstance.post("/login", {
      email,
      password,
      role: "receptionist",
    });

    const { token, user } = res.data;

    // ✅ Store token only (user will be saved via Redux)
    localStorage.setItem("token", token);

    // ✅ Save to Redux (and localStorage via slice)
    dispatch(addReceptionist(user));

    toast.success("Login successful. Welcome back!");
    navigate("/dashboard");
  } catch (err: any) {
    const message = err.response?.data?.message || "Login failed. Try again.";
    setError(message);
    toast.error(message);
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background to-muted p-4 relative">
      {/* Theme Toggle Button */}
      <div className="absolute top-4 right-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-full bg-background/90 backdrop-blur-sm hover:bg-background/70"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5 text-yellow-500" />
          ) : (
            <Moon className="h-5 w-5 text-primary" />
          )}
        </Button>
      </div>

      <div className="w-full max-w-md">
        <Card className="border-border/40 bg-background/80 shadow-xl backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold tracking-tight">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 p-6">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-background"
                    placeholder="Email address"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2 ">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-background"
                    placeholder="Password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full transition-all mt-2 " disabled={isLoading}>

                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>

         <CardFooter className="">
            <div className="w-full text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="font-medium text-primary hover:underline"
              >
                Create an account
              </button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
