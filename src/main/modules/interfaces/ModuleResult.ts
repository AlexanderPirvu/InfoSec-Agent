export interface ModuleResult {
    status: "success" | "warn" | "fail"
    message: string
    fix?: string
    moduleName: string
}