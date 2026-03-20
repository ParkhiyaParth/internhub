import client from "@/lib/apolloClient";
import { gql } from "@apollo/client"

// const GET_INTERN_INFO = gql`
// query GetInternInfo() {
//   User {
//     email
//     id
//     role
//   }
// }
// `

async function InternDash() {

  try {
    const res = await fetch("http://localhost:8080/v1/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiTUlrYXNhIiwiZW1haWwiOiJtaWthc2FAYWNrZXJtYW4uY29tIiwic3ViIjoiMyIsImlkIjoiMyIsInJvbGUiOiJJbnRlcm4iLCJodHRwczovL2hhc3VyYS5pby9qd3QvY2xhaW1zIjp7IngtaGFzdXJhLWRlZmF1bHQtcm9sZSI6IkludGVybiIsIngtaGFzdXJhLWFsbG93ZWQtcm9sZXMiOlsiSW50ZXJuIiwiTWFuYWdlciIsIkhSIiwiQWRtaW4iXSwieC1oYXN1cmEtdXNlci1pZCI6IjMiLCJ4LWhhc3VyYS1uYW1lIjoiTUlrYXNhIiwieC1oYXN1cmEtZW1haWwiOiJtaWthc2FAYWNrZXJtYW4uY29tIiwieC1oYXN1cmEtcm9sZSI6IkludGVybiJ9LCJpYXQiOjE3NzM5ODEwMzN9.4DLFxl9pDc5TnStF5FASUe_qg6laBgHaR9J5AK7CC2I`,
    },
    body: JSON.stringify({
      query: `
        query {
          User {
            id
            email
            role
          }
        }
      `,
    }),
  });

  const data = await res.json();
  console.log(data);
    
  } catch (error) {
    console.log("InternDash: Error fetching data", error);
    
  }

  return (
    <div>InternDash</div>
  )
}

export default InternDash