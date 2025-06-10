"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";


export const TestClient = () => {
    const trpc = useTRPC();

    const { data } = useQuery(trpc.userData.queryOptions());

    return <pre>{JSON.stringify(data, null, 2)}</pre>;
};


    