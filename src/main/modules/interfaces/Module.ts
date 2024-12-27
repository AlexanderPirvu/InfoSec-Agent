import { ModuleConfig } from "./ModuleConfig"
import { ModuleResult } from "./ModuleResult"

export interface Module {
    name: string
    path: string
    config: ModuleConfig
    result: ModuleResult[] | undefined | any
}