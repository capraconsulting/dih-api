export const DATA_LIST_LIMIT = 2;

export function createPagedResponse(result, previousPageRequested) {
    const lastPage = previousPageRequested || null;
    return {
        data: result,
        paging: {
            next: result.length < DATA_LIST_LIMIT ? null : parseInt(lastPage, 10) + 1,
            count: result.length || 0
        }
    };
}

export function cleanQueryObjectForSequelizeFindOperation(oldQuery) {
    const query = oldQuery;
    delete query.search;
    delete query.page;
    delete query.orderBy;
    delete query.order;
    return query;
}

export function getOrderDirectionFromClientQueryParameter(directionFromClient) {
    if (directionFromClient && (directionFromClient === 'ASC' || directionFromClient === 'DESC')) {
        return directionFromClient;
    }
    return 'ASC';
}

export function createOrderArrayForSequelizeFindOperation(query) {
    if (!query.orderBy) {
        return null;
    }
    const orderDirection = getOrderDirectionFromClientQueryParameter(query.order);
    return [query.orderBy, orderDirection];
}
