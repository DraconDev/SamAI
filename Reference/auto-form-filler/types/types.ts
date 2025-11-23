export type Env = {
    env: string;
};

export type CommonFormFieldTypes = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    education: string;
    experience: string;
    skills: string;
    additionalInfo: string;
};

export interface FormField {
    id?: string;
    name?: string;
    type: string;
    label?: string;
    placeholder?: string;
    value?: string;
    required?: boolean;
    ariaLabel?: string;
}

export interface FormAnalysis {
    fields: FormField[];
    formContext?: string;
    url: string;
}

export interface FormFillResult {
    success: boolean;
    error?: string;
    filledFields: string[];
}
