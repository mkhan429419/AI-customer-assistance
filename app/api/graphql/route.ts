import serverClient from "@/lib/server/serverClient";
import { gql } from "@apollo/client";
import { NextRequest, NextResponse } from "next/server";

const corsHeaders={
    "Access-Control-Allow-Origin":"*",
    "Access-Control-Allow-Methods":"POST,GET,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers":"Content-Type, Authorization",

}
export async function POST(request: NextRequest){
    const {query,  variables}=await request.json();

    console.log('query:',query,'variables',variables)

    try{
        let result;
        if(query.trim().startsWith("mutation")){
           result=await serverClient.mutate({
            mutation:gql`${query}`,
            variables
           })
    }else{
        result=await serverClient.query({
            query:gql`${query}`,
            variables
        })
    }
console.log('result:',result)
    const data=result.data;
    return NextResponse.json({
        data
    },
{
    headers: corsHeaders,
});
}
    catch(error){
        console.error(error)
        return NextResponse.json(error,
        {
            status:500,
        })
    }
}