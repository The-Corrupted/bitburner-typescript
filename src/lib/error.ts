
// Error handling types
export type Result<T> = { ok: true, value: T } | { ok: false, error: string, }

export const Ok = <T>(value: T): Result<T> => {
	return { ok: true, value: value };
}

export const Err = <T>(message: string): Result<T> => {
	return { ok: false, error: message };
}
