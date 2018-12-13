export interface ITraceInfo {
    readonly name: string;
    readonly depth: number;
    params: ReadonlyArray<unknown> | null;
    next: ITraceInfo | null;
    prev: ITraceInfo | null;
}
export interface ITraceWriter {
    write(info: ITraceInfo): void;
}
export declare const Reporter: {
    write(code: number, ...params: unknown[]): void;
    error(code: number, ...params: unknown[]): Error;
};
export declare const Tracer: {
    /**
     * A convenience property for the user to conditionally call the tracer.
     * This saves unnecessary `noop` and `slice` calls in non-AOT scenarios even if debugging is disabled.
     * In AOT these calls will simply be removed entirely.
     *
     * This property **only** turns on tracing if `@aurelia/debug` is included and configured as well.
     */
    enabled: boolean;
    liveLoggingEnabled: boolean;
    liveWriter: ITraceWriter;
    /**
     * Call this at the start of a method/function.
     * Each call to `enter` **must** have an accompanying call to `leave` for the tracer to work properly.
     * @param name Any human-friendly name to identify the traced method with.
     * @param args Pass in `Array.prototype.slice.call(arguments)` to also trace the parameters, or `null` if this is not needed (to save memory/cpu)
     */
    enter(name: string, args: unknown[]): void;
    /**
     * Call this at the end of a method/function. Pops one trace item off the stack.
     */
    leave(): void;
    /**
     * Writes only the trace info leading up to the current method call.
     * @param writer An object to write the output to.
     */
    writeStack(writer: ITraceWriter): void;
    /**
     * Writes all trace info captured since the previous flushAll operation.
     * @param writer An object to write the output to. Can be null to simply reset the tracer state.
     */
    flushAll(writer: ITraceWriter): void;
    /**
     * Writes out each trace info item as they are traced.
     * @param writer An object to write the output to.
     */
    enableLiveLogging(writer: ITraceWriter): void;
    /**
     * Stops writing out each trace info item as they are traced.
     */
    disableLiveLogging(): void;
};
//# sourceMappingURL=reporter.d.ts.map