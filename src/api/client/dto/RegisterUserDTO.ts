interface RegisterUserDTO {
   email: string;
   password: string;
   name: string;
   cpf: string;
   phone: string;
   dateOfBirth: string;
   gender: string;
   zipCode: string;
   address: string;
   number: string;
   neighborhood: string;
   city: string;
   state: string;
   admissionDate: string;
   Cbo: string;
   startingSalary: number;
   natureOfThePosition: string;
   sector: string;
   paymentMethod: string;
   initialHour: string;
   finalHour: string;
   lunchInitialHour: string;
   lunchFinalHour: string;
   daysOfWork: string[];
}

export { RegisterUserDTO };
