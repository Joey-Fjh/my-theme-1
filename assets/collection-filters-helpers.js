import { data } from 'alpine-adapter';

export const COLLECTION_FILTERS_FORM_ID = 'CollectionFiltersForm';
export const COLLECTION_FILTERS_DIALOG_ID = 'collection-filters';

export function buildRelativeUrlFromParams(pathname, params) {
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
}

export function buildAbsoluteUrlFromParams(pathname, params) {
    return buildRelativeUrlFromParams(pathname, params);
}

export function resolveFiltersFormId(instance) {
    return instance?.formId || COLLECTION_FILTERS_FORM_ID;
}

export function resolveFiltersDialogId(instance) {
    return instance?.dialogId || COLLECTION_FILTERS_DIALOG_ID;
}

export function getCollectionFilterControls(formId = COLLECTION_FILTERS_FORM_ID) {
    const form = document.getElementById(formId);
    if (!form) return [];

    const controls = [
        ...Array.from(form.elements || []),
        ...Array.from(document.querySelectorAll(`[form="${formId}"]`)),
    ];

    return controls.filter((field, index) => controls.indexOf(field) === index);
}

export function syncCollectionPriceComponentState(fieldName, nextValue, field) {
    if (!fieldName.endsWith('.gte') && !fieldName.endsWith('.lte')) return;

    const componentRoot = field.closest('[data-module-id="collection-filter-field"]');
    const componentData = componentRoot ? data(componentRoot) : null;

    if (!componentData) return;

    if (fieldName.endsWith('.gte')) {
        componentData.setMinFromInput?.(nextValue);
        return;
    }

    componentData.setMaxFromInput?.(nextValue);
}

export function syncCollectionControlPeers(source, formId = COLLECTION_FILTERS_FORM_ID) {
    if (!source?.name) return;

    const peers = getCollectionFilterControls(formId).filter(
        (field) => field !== source && field?.name === source.name,
    );

    peers.forEach((field) => {
        if (source.type === 'checkbox' || source.type === 'radio') {
            if (field.type === source.type && field.value === source.value) {
                field.checked = source.checked;
            }
            return;
        }

        if (source.tagName === 'SELECT' && source.multiple) {
            const selectedValues = new Set(
                Array.from(source.selectedOptions || []).map((option) => option.value),
            );
            Array.from(field.options || []).forEach((option) => {
                option.selected = selectedValues.has(option.value);
            });
            return;
        }

        field.value = source.value;
        syncCollectionPriceComponentState(field.name, source.value, field);
    });
}

export function syncCollectionControlsFromUrl(url, formId = COLLECTION_FILTERS_FORM_ID) {
    const targetUrl = new URL(url, window.location.origin);
    const searchParams = targetUrl.searchParams;
    const controls = Array.from(document.querySelectorAll(`[form="${formId}"]`));

    controls.forEach((field) => {
        if (!field?.name) return;

        const values = searchParams.getAll(field.name);

        if (field.type === 'checkbox' || field.type === 'radio') {
            field.checked = values.includes(field.value);
            return;
        }

        if (field.tagName === 'SELECT' && field.multiple) {
            Array.from(field.options || []).forEach((option) => {
                option.selected = values.includes(option.value);
            });
            return;
        }

        const nextValue = values.length > 0 ? values[values.length - 1] : '';
        field.value = nextValue;
        syncCollectionPriceComponentState(field.name, nextValue, field);
    });
}

function normalizeCollectionSingleValueField(field) {
    const fieldName = field?.name || '';
    const rawValue = typeof field?.value === 'string' ? field.value.trim() : field?.value;

    if (fieldName === 'sort_by') {
        return rawValue || null;
    }

    if (fieldName.endsWith('.gte')) {
        const nextValue = Number(rawValue);
        if (!rawValue || !Number.isFinite(nextValue) || nextValue <= 0) {
            return null;
        }
        return String(nextValue);
    }

    if (fieldName.endsWith('.lte')) {
        const nextValue = Number(rawValue);
        const maxValue = Number(field.getAttribute('max') || field.max);

        if (!rawValue || !Number.isFinite(nextValue)) {
            return null;
        }

        if (Number.isFinite(maxValue) && nextValue >= maxValue) {
            return null;
        }

        return String(nextValue);
    }

    return rawValue ?? null;
}

export function readCollectionFormParams(formId = COLLECTION_FILTERS_FORM_ID) {
    const form = document.getElementById(formId);
    if (!form) {
        return new URLSearchParams(window.location.search);
    }

    const params = new URLSearchParams();
    const controls = getCollectionFilterControls(formId);
    const appendedMultiValues = new Set();
    const isSingleValueField = (fieldName) =>
        fieldName === 'sort_by' || fieldName.endsWith('.gte') || fieldName.endsWith('.lte');
    const appendMultiValue = (fieldName, value) => {
        const key = `${fieldName}\u0000${value}`;
        if (appendedMultiValues.has(key)) return;
        appendedMultiValues.add(key);
        params.append(fieldName, value);
    };

    controls.forEach((field) => {
        if (
            !field ||
            !field.name ||
            field.disabled ||
            field.type === 'submit' ||
            field.type === 'button' ||
            field.type === 'reset' ||
            field.type === 'file'
        ) {
            return;
        }

        if ((field.type === 'checkbox' || field.type === 'radio') && !field.checked) {
            return;
        }

        if (field.tagName === 'SELECT' && field.multiple) {
            Array.from(field.selectedOptions || []).forEach((option) => {
                appendMultiValue(field.name, option.value);
            });
            return;
        }

        if (isSingleValueField(field.name)) {
            const normalizedValue = normalizeCollectionSingleValueField(field);
            if (normalizedValue === null) return;
            params.set(field.name, normalizedValue);
            return;
        }

        appendMultiValue(field.name, field.value);
    });

    return params;
}

export function resolveCollectionTabUrl(targetHref, currentParams) {
    if (!targetHref) return '';

    const targetUrl = new URL(targetHref, window.location.origin);
    const nextParams = new URLSearchParams();
    const sortBy = currentParams.get('sort_by');

    if (sortBy) {
        nextParams.set('sort_by', sortBy);
    }

    return buildAbsoluteUrlFromParams(targetUrl.pathname, nextParams);
}

export function resolveCollectionFilterActionUrl(targetHref, currentParams) {
    if (!targetHref) return window.location.pathname;

    const targetUrl = new URL(targetHref, window.location.origin);
    const nextParams = new URLSearchParams(targetUrl.search);
    const sortBy = currentParams.get('sort_by');

    if (sortBy && !nextParams.has('sort_by')) {
        nextParams.set('sort_by', sortBy);
    }

    nextParams.delete('page');

    return buildAbsoluteUrlFromParams(targetUrl.pathname, nextParams);
}

const SEARCH_CONTEXT_PARAM_KEYS = ['q', 'type', 'options[prefix]'];

export function resolveSearchFilterActionUrl(targetHref, currentParams) {
    const resolved = resolveCollectionFilterActionUrl(targetHref, currentParams);
    const targetUrl = new URL(resolved, window.location.origin);
    const nextParams = new URLSearchParams(targetUrl.search);

    SEARCH_CONTEXT_PARAM_KEYS.forEach((key) => {
        const value = currentParams.get(key);
        if (value && !nextParams.has(key)) {
            nextParams.set(key, value);
        }
    });

    nextParams.delete('page');

    return buildAbsoluteUrlFromParams(targetUrl.pathname, nextParams);
}

export function requestCollectionSectionHtml(http, url, sectionId, signal) {
    const sep = url.includes('?') ? '&' : '?';
    const fetchUrl = `${url}${sep}section_id=${encodeURIComponent(sectionId)}`;

    return http
        .request(fetchUrl, {
            method: 'GET',
            headers: {
                Accept: 'text/html',
            },
            signal,
        })
        .then((response) => response.text());
}

export function buildCollectionNavigationHref(basePath, sortBy) {
    const path = typeof basePath === 'string' ? basePath.trim() : '';
    if (!path) return path;

    const url = new URL(path, window.location.origin);
    const cleanSortBy = typeof sortBy === 'string' ? sortBy.trim() : '';

    if (cleanSortBy) {
        url.searchParams.set('sort_by', cleanSortBy);
    } else {
        url.searchParams.delete('sort_by');
    }

    return `${url.pathname}${url.search}`;
}

export function requestCollectionNavigationSectionHtml(
    http,
    pathname,
    sectionId,
    page,
    sortBy,
    signal,
) {
    const url = new URL(pathname, window.location.origin);
    url.searchParams.set('section_id', sectionId);
    url.searchParams.set('page', String(page));

    if (sortBy) {
        url.searchParams.set('sort_by', sortBy);
    }

    return http
        .request(`${url.pathname}${url.search}`, {
            method: 'GET',
            headers: {
                Accept: 'text/html',
            },
            signal,
        })
        .then((response) => response.text());
}
