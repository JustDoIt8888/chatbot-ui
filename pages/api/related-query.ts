import { postRelatedQueryEndpoint } from "@/utils/app/api";
import { RelatedQuery } from "@/utils/server";

export const config = {
    runtime: 'edge',
};

export const handler = async(req: Request): Promise<Response> => {
    try {
        const { query, model } = await req.json();
        const response = await RelatedQuery(query, model);
        return response;
    } catch (err) {
        console.error(err)
        return new Response('Error', { status: 500 });
    }
};

export default handler;