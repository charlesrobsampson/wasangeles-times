import { Config } from "@serverless-stack/resources";

export default function secrets({ stack }) {
    const OBSERVATION_TOKEN = new Config.Secret(stack, "OBSERVATION_TOKEN");
    return { OBSERVATION_TOKEN };
}