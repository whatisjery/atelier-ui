/*
 * The directories that contribute content, registry files and docs to this
 * app. Deployments that build on top of this repository provide their own
 * copy of this module listing every contributing checkout, base first.
 * Later roots overlay earlier ones.
 */
export const appRoots: string[] = [process.cwd()]
