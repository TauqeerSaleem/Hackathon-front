import { useForm } from "react-hook-form";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [message, setMessage] = useState("");

  const onSubmit = (data) => {
    console.log("Logging in with:", data);
    setMessage("Login successful!");
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center mb-4">Login</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <Input type="text" {...register("username", { required: "Username is required" })} />
            {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <Input type="password" {...register("password", { required: "Password is required" })} />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>
          <Button type="submit" className="w-full">Login</Button>
        </form>
        {message && <p className="text-green-500 text-center mt-2">{message}</p>}
      </div>
    </div>
  );
}
