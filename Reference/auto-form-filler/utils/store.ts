import { CommonFormFieldTypes, Env } from "@/types/types";

export const defaultEnv: Env = {
    env: "",
};

export const env = storage.defineItem<Env>("sync:env", {
    fallback: defaultEnv,
});

export const defaultCommonFormFields = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    education: "",
    experience: "",
    skills: "",
    additionalInfo: "",
};

export const commonFormFields = storage.defineItem<CommonFormFieldTypes>(
    "sync:commonFormFields",
    {
        fallback: defaultCommonFormFields,
    }
);

export const descriptionEnabled = storage.defineItem<boolean>(
    "sync:descriptionEnabled",
    {
        fallback: false,
    }
);
