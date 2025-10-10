class ListTerm {
   async execute() {
      return strapi.documents("api::term.term").findFirst();
   }
}

export { ListTerm };
