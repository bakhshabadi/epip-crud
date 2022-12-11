export type QP_LTE<T> = {
    [P in keyof T  as `${string & P}__lte`]: T[P];
};
export type QP_LT<T> = {
    [P in keyof T  as `${string & P}__lt`]: T[P];
};
export type QP_GTE<T> = {
    [P in keyof T  as `${string & P}__gte`]: T[P];
};
export type QP_GT<T> = {
    [P in keyof T  as `${string & P}__gt`]: T[P];
};

export type QP_LIKE<T> = {
    [P in keyof T  as `${string & P}__like`]: T[P];
};

export type QP_IN<T> = {
    [P in keyof T  as `${string & P}__in`]: T[P];
};

export type QP_ISNULL<T> = {
    [P in keyof T  as `${string & P}__isnull`]: boolean;
};

export type QUERY<T> = T | QP_LTE<T> | QP_GTE<T> | QP_LT<T> | QP_GT<T> | QP_LIKE<T> | QP_IN<T> | QP_ISNULL<T>