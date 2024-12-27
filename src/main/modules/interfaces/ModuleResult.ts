export interface ModuleResult {
    status: "success" | "warning" | "fail"
    message: string
    fix?: string
    moduleName: string
}