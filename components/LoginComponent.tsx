"use client";

import { Form, Formik, FormikHelpers, FormikValues } from "formik";
import LabeledInput from "./LabeledInput";
import NormalInputShowPassword from "./LabeledInputShowPassword";
import LabeledCheckbox from "./LabeledCheckbox";
import * as yup from "yup";
import NormalInput from "./NormalInput";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginComponent() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nav = useRouter();
  const paths = useSearchParams();
  const validationSchema = yup.object().shape({
    email: yup.string().email().required("Email is required"),
    password: yup.string().required("Password is required"),
    remember_me: yup.boolean(),
  });

 

  const loginMutation = useMutation({
    mutationFn: async (values: any) => {
      setIsSubmitting(true);
      let headersList = {
        Accept: "*/*",
        "User-Agent": "Thunder Client (https://www.thunderclient.com)",
        "Content-Type": "application/json",
      };

      let bodyContent = JSON.stringify({
        email: values.email,
        password: values.password,
        remember_me: values.remember_me,
      });

      let response = await fetch("/api/v1/auth", {
        method: "POST",
        body: bodyContent,
        headers: headersList,
      });

      let data = await response.json();
      return data;
    },
    onSuccess: (data) => {
      if (data.code == 200) {
        console.log(data.code);
        window.localStorage.setItem("user", JSON.stringify(data.data.user));
        setIsSubmitting(false);
        nav.push("/dashboard");
        toast.success(data.message);
      } else {
        setIsSubmitting(false);
        toast.error(data.message);
      }
    },
    onError: (error) => {
      console.log(error);
      setIsSubmitting(false);
      toast.error("An error occured");
    },
  });

  return (
    <div className="hero-content flex-col lg:flex-row-reverse">
      <div className="text-center lg:text-left">
        <h1 className="text-5xl font-bold">Login now!</h1>
        <p className="py-6">
          To login with your account, please enter your email and password. To
          stay logged in, check the remember me checkbox.
        </p>
      </div>
      <div className="card shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
        <Formik
          initialValues={{
            email: "",
            password: "",
            remember_me: false,
          }}
          validationSchema={validationSchema}
          onSubmit={(values: any) => {
            loginMutation.mutate(values);
          }}
        >
          {({ errors, touched }) => (
            <Form className="card-body">
              <LabeledInput
                field_name="email"
                label="Email"
                placeholder="Email"
                type="email"
                errors={errors.email}
                touched={touched.email}
                className={"input input-bordered"}
              />
              <NormalInputShowPassword
                field_name="password"
                label="Password"
                placeholder="Password"
                type="text"
                errors={errors.password}
                touched={touched.password}
                className={"input input-bordered"}
              />
              <LabeledCheckbox
                field_name="remember_me"
                label="Remember me?"
                placeholder="Remember me?"
                type="checkbox"
                errors={errors.remember_me}
                touched={touched.remember_me}
                className={"checkbox"}
              />
              <div className="label">
                <Link className="label-text" href={"/register"}>
                  Register
                </Link>
                <Link className="label-text" href={"/forgotpassword"}>
                  Forgot Password
                </Link>
              </div>

              <div className="form-control">
                <button
                  type="submit"
                  className={`btn ${
                    isSubmitting ? "btn-disabled" : "btn-primary"
                  }`}
                >
                  {isSubmitting ? "Logging in..." : "Login"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
