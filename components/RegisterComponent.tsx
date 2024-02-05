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
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterComponent() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nav=useRouter();
  const validationSchema = yup.object().shape({
    email: yup.string().email().required("Email is required"),
    password: yup
      .string()
      .required("Password is required")
      .min(8, "Password must be at least 8 characters")
      .uppercase("Password must contain at least one uppercase letter")
      .lowercase("Password must contain at least one lowercase letter")
      .matches(/(?=.*\d)/, "Password must contain at least one number"),
    reenterpassword: yup
      .string()
      .min(8, "Password must be at least 8 characters")
      .uppercase("Password must contain at least one uppercase letter")
      .lowercase("Password must contain at least one lowercase letter")
      .matches(/(?=.*\d)/, "Password must contain at least one number")
      .oneOf([yup.ref("password")], "Passwords must match")
      .required("Repeat Password is required"),
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

      let response = await fetch("/api/v1/register", {
        method: "POST",
        body: bodyContent,
        headers: headersList,
      });

      let data = await response.json();
      return data;
    },
    onSuccess: (data) => {
      if (data.code == 200) {
        setIsSubmitting(false);
        toast.success(data.message);
        nav.push("/login");
      } else {
        setIsSubmitting(false);
        toast.error(data.message);
      }
    },
    onError: (error) => {
      setIsSubmitting(false);
      toast.error("An error occured");
    },
  });

  return (
    <div className="hero-content flex-col lg:flex-row-reverse">
      <div className="text-center lg:text-left">
        <h1 className="text-5xl font-bold">Register now!</h1>
        <p className="py-6">
          To register with your account, please enter your faucetpay email .
          Password should not be same as your faucetpay password for security.
        </p>
      </div>
      <div className="card shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
        <Formik
          initialValues={{
            email: "",
            password: "",
            reenterpassword: "",
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
                label="Faucetpay Email"
                placeholder="Faucetpay Email"
                type="email"
                errors={errors.email}
                touched={touched.email}
                className={"input input-bordered"}
              />
              <LabeledInput
                field_name="password"
                label="Password"
                placeholder="Password"
                type="password"
                errors={errors.password}
                touched={touched.password}
                className={"input input-bordered"}
              />
              <NormalInputShowPassword
                field_name="reenterpassword"
                label="Repeat Password"
                placeholder="Repeat Password"
                type="text"
                errors={errors.reenterpassword}
                touched={touched.reenterpassword}
                className={"input input-bordered"}
              />
              <div className="label">
                <Link className="label-text" href={"/login"}>
                  Login
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
                  {isSubmitting ? "Registering..." : "Register"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
