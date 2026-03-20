import { InMemoryCache } from "@apollo/client";
import { ApolloClient, HttpLink } from "@apollo/client";

 
const link = new HttpLink({
  uri: "http://localhost:8080/v1/graphql", // Hasura GraphQL endpoint
  headers: {
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiTUlrYXNhIiwiZW1haWwiOiJtaWthc2FAYWNrZXJtYW4uY29tIiwic3ViIjoiMyIsImlkIjoiMyIsInJvbGUiOiJJbnRlcm4iLCJodHRwczovL2hhc3VyYS5pby9qd3QvY2xhaW1zIjp7IngtaGFzdXJhLWRlZmF1bHQtcm9sZSI6IkludGVybiIsIngtaGFzdXJhLWFsbG93ZWQtcm9sZXMiOlsiSW50ZXJuIiwiTWFuYWdlciIsIkhSIiwiQWRtaW4iXSwieC1oYXN1cmEtdXNlci1pZCI6IjMiLCJ4LWhhc3VyYS1uYW1lIjoiTUlrYXNhIiwieC1oYXN1cmEtZW1haWwiOiJtaWthc2FAYWNrZXJtYW4uY29tIiwieC1oYXN1cmEtcm9sZSI6IkludGVybiJ9LCJpYXQiOjE3NzM5ODEwMzN9.4DLFxl9pDc5TnStF5FASUe_qg6laBgHaR9J5AK7CC2I" // replace with your secret
  },
});
 
const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});
 
export default client;
 