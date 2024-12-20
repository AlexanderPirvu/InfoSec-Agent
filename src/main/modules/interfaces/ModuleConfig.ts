export interface ModuleConfig {
    name: string
    exec: string
    isSudo: boolean
    os: string[]
    authors?: string[]
    desc?: string
    version?: string
    args?: string[]
    out?: {} | null
}