import client from "@/lib/apolloClient";
import { requireAuth } from "@/lib/middleware/requireRole";
import { gql } from "@apollo/client";
import { NextRequest, NextResponse } from "next/server";

const GET_INTERN_INFO = gql`
  query GetInternInfo($id: Int!) {
    User(where: { id: { _eq: $id } }) {
      email
      name
      id
      role
    }
    Info {
      address
      colleg
      course
      degree
      fullName
      phone
    }
    Department {
      name
    }
  }
`;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireAuth(req, ["Admin", "Manager", "HR", "Intern"]);
  let data: any;
  const { id } = await params;

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    data = await client.query({
      query: GET_INTERN_INFO,
      variables: { id: parseInt(id) },
    });

    if (!data?.data?.User?.length) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
  } catch (error) {
    console.log("InternDash: Error fetching data", error);
    return NextResponse.json(
      { message: "Error fetching data", error },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { message: "User fetched successfully", data },
    { status: 200 },
  );
}
