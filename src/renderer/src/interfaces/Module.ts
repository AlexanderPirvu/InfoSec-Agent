import { ModuleConfig } from "./ModuleConfig"

export interface Module {
    name: string
    path: string
    config: ModuleConfig
    result: any
}