import React, { useState, useEffect, useRef } from 'react';
import { AssetPicker } from '@scaleflex/asset-picker/react';
import { useIntl } from 'react-intl';
import { Box, Button, Field, Typography, Modal } from '@strapi/design-system';
import { Eye } from '@strapi/icons';
import { useFetchClient } from '@strapi/strapi/admin';
import { PLUGIN_ID } from '../pluginId';

// ─── Storage helpers ──────────────────────────────────────────────────────────

const getItemUrl = (item) => {
  if (typeof item === 'string') return item;
  return item?.cdn || item?.url?.cdn || item?.url?.public || '';
};

const parseStoredItems = (raw) => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return [raw];
  }
};

const serializeItems = (items, effectiveMulti, hasAttrs) => {
  if (items.length === 0) return '';
  if (!effectiveMulti) {
    const item = items[0];
    return hasAttrs ? JSON.stringify(item) : getItemUrl(item);
  }
  return JSON.stringify(items);
};

const buildItem = (asset, attrKeys, config, hasAttrs) => {
  let cdn = asset.cdn || asset.url?.cdn || asset.url?.public || '';
  if (config?.cname) {
    cdn = cdn.replace(`https://${config.token}.filerobot.com/v7`, `https://${config.cname}`);
  }
  if (!hasAttrs) return cdn;

  const result = {
    uuid: asset.uuid,
    name: asset.name,
    cdn,
    extension: asset.extension,
    source: asset.source,
    type: asset.type,
  };

  if (attrKeys.length > 0) {
    const picked = {};
    for (const key of attrKeys) {
      if (asset[key] !== undefined) picked[key] = asset[key];
    }
    if (Object.keys(picked).length > 0) result.attributes = picked;
  }
  console.log(result);
  return result;
};

// ─── Formatting helpers ───────────────────────────────────────────────────────

const formatValueText = (val) => {
  if (val === null || val === undefined) return '-';
  if (Array.isArray(val)) {
    return val
      .map((item) =>
        typeof item === 'object' && item !== null
          ? String(item.label ?? item.value ?? item.name ?? JSON.stringify(item))
          : String(item)
      )
      .join(', ');
  }
  if (typeof val === 'object') {
    return Object.entries(val)
      .map(([k, v]) => `${k}: ${formatValueText(v)}`)
      .join('\n');
  }
  return String(val);
};

const isMultilineVal = (val) => typeof val === 'object' && val !== null && !Array.isArray(val);

const isEmpty = (val) => {
  if (val === null || val === undefined || val === '') return true;
  if (Array.isArray(val)) return val.length === 0;
  if (typeof val === 'object') return Object.keys(val).length === 0;
  return false;
};

const getPreviewUrl = (url) => {
  if (!url) return '';
  try {
    const [base, query] = url.split('?');
    const params = new URLSearchParams(query || '');
    params.set('width', '800');
    return `${base}?${params.toString()}`;
  } catch {
    return url;
  }
};

const getTypeCategory = (type) => (type || '').split('/')[0];

// ─── Field title cache (module-level, keyed by token) ─────────────────────────

const fieldTitleCache = {};

const fetchFieldTitles = async (token) => {
  if (fieldTitleCache[token]) return fieldTitleCache[token];
  try {
    const res = await fetch(`https://api.filerobot.com/${token}/v5/settings`);
    if (!res.ok) return {};
    const data = await res.json();
    const fields = (data.metadata?.model ?? [])
      .flatMap((entry) => (entry.groups ?? []).flatMap((group) => group.fields ?? []));
    const map = {};
    for (const f of fields) {
      if (f.key && f.title) map[f.key] = f.title;
    }
    fieldTitleCache[token] = map;
    return map;
  } catch {
    return {};
  }
};

// ─── Preview modal ────────────────────────────────────────────────────────────

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 5;
const ZOOM_STEP = 0.25;

// InfoRow: label (uppercase, small, gray) above value — matches fr-detail-row pattern
const InfoRow = ({ label, value, isMultiline = false, mono = false }) => (
  <Box style={{
    display: 'flex',
    flexDirection: 'column',
    padding: '8px 0',
    borderBottom: '1px solid #f3f4f6',
  }}>
    <span style={{
      fontSize: '11px',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      color: '#9ca3af',
      marginBottom: '2px',
    }}>
      {label}
    </span>
    {isMultiline ? (
      <span style={{
        whiteSpace: 'pre-line',
        background: '#f9fafb',
        padding: '6px 8px',
        borderRadius: '4px',
        border: '1px solid #f3f4f6',
        fontSize: '12px',
        lineHeight: '1.6',
        marginTop: '4px',
        color: '#374151',
        wordBreak: 'break-word',
      }}>
        {formatValueText(value)}
      </span>
    ) : (
      <span style={{
        fontSize: mono ? '11px' : '13px',
        color: mono ? '#6b7280' : '#374151',
        fontFamily: mono ? 'monospace' : 'inherit',
        wordBreak: 'break-word',
      }}>
        {formatValueText(value)}
      </span>
    )}
  </Box>
);

// NavArrow: white bg with border — matches fr-nav-arrow style
const NavArrow = ({ direction, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      position: 'absolute',
      top: '50%',
      [direction === 'prev' ? 'left' : 'right']: '12px',
      transform: 'translateY(-50%)',
      background: 'rgba(255,255,255,0.9)',
      border: '1px solid #e5e7eb',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      cursor: 'pointer',
      color: '#374151',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    }}
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      {direction === 'prev'
        ? <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z" />
        : <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
      }
    </svg>
  </button>
);

const PreviewModal = ({ items, initialIndex, onClose, fieldTitles = {} }) => {
  const [index, setIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, panX: 0, panY: 0 });

  const item = items[index] ?? null;
  const url = item ? getItemUrl(item) : '';
  const isObject = item && typeof item === 'object';
  const typeCategory = isObject && item.type ? getTypeCategory(item.type) : 'image';
  const isImage = typeCategory === 'image';
  const isVideo = typeCategory === 'video';
  const isAudio = typeCategory === 'audio';
  const isZoomed = zoom !== 1;
  const hasPrev = index > 0;
  const hasNext = index < items.length - 1;

  useEffect(() => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
    setIsDragging(false);
  }, [index]);

  const getFieldTitle = (key) => fieldTitles[key] || key;

  const applyZoom = (fn) => {
    setZoom((z) => {
      const nz = fn(z);
      if (nz === 1) { setPanX(0); setPanY(0); }
      return nz;
    });
  };

  const handleWheel = (e) => {
    if (!isImage) return;
    e.preventDefault();
    const delta = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
    applyZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, +(z + delta).toFixed(2))));
  };

  const handleMouseDown = (e) => {
    if (!isZoomed || !isImage) return;
    e.preventDefault();
    setIsDragging(true);
    dragRef.current = { startX: e.clientX, startY: e.clientY, panX, panY };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const { startX, startY, panX: px, panY: py } = dragRef.current;
    setPanX(px + (e.clientX - startX));
    setPanY(py + (e.clientY - startY));
  };

  const handleMouseUp = () => setIsDragging(false);

  const resetZoom = () => { setZoom(1); setPanX(0); setPanY(0); };

  const imgStyle = {
    transform: `scale(${zoom}) translate(${panX / zoom}px, ${panY / zoom}px)`,
    transition: isDragging ? 'none' : 'transform 0.15s ease',
    maxWidth: '90%',
    maxHeight: 'calc(100vh - 200px)',
    objectFit: 'contain',
    userSelect: 'none',
    pointerEvents: 'none',
    display: 'block',
    borderRadius: '4px',
    willChange: 'transform',
    backfaceVisibility: 'hidden',
    transformOrigin: 'center center',
  };

  const renderMedia = () => {
    if (isImage) {
      return (
        <img
          src={getPreviewUrl(url)}
          alt={isObject ? item.name : 'Preview'}
          style={imgStyle}
          draggable={false}
        />
      );
    }
    if (isVideo) {
      return (
        <video controls style={{ maxWidth: '100%', maxHeight: 'calc(100vh - 200px)' }}>
          <source src={url} type={item.type} />
        </video>
      );
    }
    if (isAudio) {
      return (
        <audio controls style={{ width: '300px' }}>
          <source src={url} type={item.type} />
        </audio>
      );
    }
    return (
      <div style={{ textAlign: 'center', color: '#9ca3af' }}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor" width="80" height="80">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </svg>
        <p style={{ marginTop: '8px', fontSize: '18px', fontWeight: 600 }}>
          .{isObject ? item.extension : ''}
        </p>
      </div>
    );
  };

  const renderAttributes = (item) => {
    if (!isObject || !item.attributes) return null;
    const entries = Object.entries(item.attributes);
    if (entries.length === 0) return null;

    const groups = [];

    for (const [key, val] of entries) {
      if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
        // Flatten object: each sub-key becomes its own InfoRow under a group header
        const subRows = Object.entries(val)
          .filter(([, subVal]) => !isEmpty(subVal))
          .map(([subKey, subVal]) => (
            <InfoRow
              key={`${key}.${subKey}`}
              label={getFieldTitle(subKey)}
              value={subVal}
              isMultiline={isMultilineVal(subVal)}
            />
          ));

        if (subRows.length > 0) {
          groups.push(
            <React.Fragment key={key}>
              <span style={{
                display: 'block',
                fontSize: '10px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#6b7280',
                padding: '10px 0 2px',
              }}>
                {key}
              </span>
              {subRows}
            </React.Fragment>
          );
        }
      } else if (!isEmpty(val)) {
        groups.push(
          <InfoRow key={key} label={getFieldTitle(key)} value={val} isMultiline={false} />
        );
      }
    }

    if (groups.length === 0) return null;

    return (
      <>
        <Box style={{ borderTop: '1px solid #e5e7eb', margin: '8px 0' }} />
        <span style={{
          display: 'block',
          fontSize: '12px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: '#374151',
          padding: '8px 0 4px',
        }}>
          Attributes
        </span>
        {groups}
      </>
    );
  };

  return (
    <Modal.Root open onOpenChange={(open) => !open && onClose()}>
      <Modal.Content style={{ maxWidth: '1200px', width: '90vw' }}>
        <Modal.Header>
          <Modal.Title>
            {isObject ? item.name : 'Asset preview'}
            {items.length > 1 && (
              <Typography as="span" variant="pi" textColor="neutral500" style={{ marginLeft: '8px' }}>
                ({index + 1} / {items.length})
              </Typography>
            )}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Box style={{ display: 'flex', minHeight: '460px' }}>

            {/* ── Left: media area ────────────────────────── */}
            <Box style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Box
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                style={{
                  position: 'relative',
                  flex: 1,
                  overflow: 'hidden',
                  background: '#f3f4f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '380px',
                  cursor: isImage
                    ? (isZoomed ? (isDragging ? 'grabbing' : 'grab') : 'default')
                    : 'default',
                  userSelect: 'none',
                }}
              >
                {renderMedia()}

                {hasPrev && <NavArrow direction="prev" onClick={() => setIndex((i) => i - 1)} />}
                {hasNext && <NavArrow direction="next" onClick={() => setIndex((i) => i + 1)} />}

                {isImage && (
                  <Box style={{
                    position: 'absolute',
                    bottom: '16px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'rgba(0,0,0,0.7)',
                    borderRadius: '8px',
                    padding: '4px 8px',
                    zIndex: 20,
                    userSelect: 'none',
                  }}>
                    <button
                      type="button"
                      onClick={() => applyZoom((z) => Math.max(MIN_ZOOM, +(z - ZOOM_STEP).toFixed(2)))}
                      disabled={zoom <= MIN_ZOOM}
                      style={{
                        background: 'none', border: 'none',
                        cursor: zoom <= MIN_ZOOM ? 'not-allowed' : 'pointer',
                        color: '#fff', padding: '4px', borderRadius: '4px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        opacity: zoom <= MIN_ZOOM ? 0.3 : 1,
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 13H5v-2h14v2z" />
                      </svg>
                    </button>
                    <span
                      onClick={resetZoom}
                      style={{
                        color: '#fff', fontSize: '12px', fontWeight: 600,
                        cursor: 'pointer', minWidth: '42px', textAlign: 'center',
                        padding: '2px 4px', borderRadius: '4px',
                      }}
                      title="Reset zoom"
                    >
                      {Math.round(zoom * 100)}%
                    </span>
                    <button
                      type="button"
                      onClick={() => applyZoom((z) => Math.min(MAX_ZOOM, +(z + ZOOM_STEP).toFixed(2)))}
                      disabled={zoom >= MAX_ZOOM}
                      style={{
                        background: 'none', border: 'none',
                        cursor: zoom >= MAX_ZOOM ? 'not-allowed' : 'pointer',
                        color: '#fff', padding: '4px', borderRadius: '4px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        opacity: zoom >= MAX_ZOOM ? 0.3 : 1,
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                      </svg>
                    </button>
                  </Box>
                )}
              </Box>
            </Box>

            {/* ── Right: info sidebar ──────────────────────── */}
            <Box style={{
              width: '280px',
              flexShrink: 0,
              borderLeft: '1px solid #e5e7eb',
              background: '#fff',
              overflowY: 'scroll',
              padding: '16px',
              maxHeight: '50vh',
            }}>
              <span style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#374151',
                marginBottom: '4px',
              }}>
                File info
              </span>

              {isObject ? (
                <>
                  {!isEmpty(item.extension) && <InfoRow label="Format" value={item.extension?.toUpperCase()} />}
                  {!isEmpty(item.type) && <InfoRow label="Type" value={item.type} />}
                  {!isEmpty(item.name) && <InfoRow label="Name" value={item.name} />}
                  {!isEmpty(item.uuid) && <InfoRow label="UUID" value={item.uuid} mono />}
                  {!isEmpty(item.cdn) && <InfoRow label="CDN URL" value={item.cdn} />}
                  {!isEmpty(item.source) && <InfoRow label="Source" value={item.source} />}
                  {renderAttributes(item)}
                </>
              ) : (
                <InfoRow label="CDN URL" value={url} />
              )}
            </Box>
          </Box>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="tertiary" onClick={onClose}>Close</Button>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────

const AssetPickerInput = ({ attribute, disabled, intlLabel, name, onChange, required, value }) => {
  const { get } = useFetchClient();
  const intl = useIntl();
  const [config, setConfig] = useState(null);
  const [fieldTitles, setFieldTitles] = useState({});
  const [isOpen, setIsOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(null);
  const [hoveredUrl, setHoveredUrl] = useState(null);

  useEffect(() => {
    get(`/${PLUGIN_ID}/config`).then(({ data }) => {
      setConfig(data);
      if (data?.token) fetchFieldTitles(data.token).then(setFieldTitles);
    });
  }, []);

  const fieldOptions = attribute.options || {};
  const fileType = fieldOptions.fileType || 'all';
  const isMultiSelect = fieldOptions.multiSelect === true || fieldOptions.multiSelect === 'true';
  const limit = parseInt(fieldOptions.limit) || 0;
  const attrKeys = (fieldOptions.attributes || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const hasAttrs = attrKeys.length > 0;

  const effectiveSingle = limit === 1;
  const effectiveMulti = limit > 1 || (!effectiveSingle && isMultiSelect);
  const maxSelections = limit > 1 ? limit : undefined;

  const storedItems = parseStoredItems(value);
  const displayUrls = storedItems.map(getItemUrl).filter(Boolean);
  const atLimit = maxSelections ? storedItems.length >= maxSelections : false;
  const isConfigured = config && config.token && config.sec_temp;

  const pickerConfig = config
    ? {
      auth: {
        mode: 'securityTemplate',
        securityTemplateKey: config.sec_temp,
        projectToken: config.token,
      },
      rootFolderPath: config.folder || '/',
      multiSelect: effectiveMulti,
      ...(maxSelections && { maxSelections }),
      uploader: {},
      ...(fileType !== 'all' && {
        forcedFilters: { type: { type: 'string', values: [fileType] } },
      }),
    }
    : null;

  const handleSelect = (assets) => {
    const incoming = assets
      .map((a) => buildItem(a, attrKeys, config, hasAttrs))
      .filter((item) => getItemUrl(item));

    if (effectiveMulti) {
      const existingUrls = storedItems.map(getItemUrl);
      const fresh = incoming.filter((item) => !existingUrls.includes(getItemUrl(item)));
      const merged = [...storedItems, ...fresh];
      const capped = maxSelections ? merged.slice(0, maxSelections) : merged;
      onChange({ target: { name, value: serializeItems(capped, true, hasAttrs), type: attribute.type } });
    } else {
      const item = incoming[0];
      if (!item) return;
      onChange({ target: { name, value: serializeItems([item], false, hasAttrs), type: attribute.type } });
    }
    setIsOpen(false);
  };

  const removeItem = (urlToRemove) => {
    const remaining = storedItems.filter((item) => getItemUrl(item) !== urlToRemove);
    onChange({
      target: { name, value: serializeItems(remaining, effectiveMulti, hasAttrs), type: attribute.type },
    });
  };

  const pickLabel = () => {
    if (!effectiveMulti) {
      return displayUrls.length > 0
        ? intl.formatMessage({ id: `${PLUGIN_ID}.custom-fields.asset.change`, defaultMessage: 'Change asset' })
        : intl.formatMessage({ id: `${PLUGIN_ID}.custom-fields.asset.pick`, defaultMessage: 'Pick from Scaleflex DAM' });
    }
    const countLabel = maxSelections ? `${storedItems.length}/${maxSelections}` : `${storedItems.length}`;
    return storedItems.length > 0
      ? intl.formatMessage({ id: `${PLUGIN_ID}.custom-fields.asset.add_more`, defaultMessage: 'Add more ({count})' }, { count: countLabel })
      : intl.formatMessage({ id: `${PLUGIN_ID}.custom-fields.asset.pick`, defaultMessage: 'Pick from Scaleflex DAM' });
  };

  return (
    <Field.Root name={name} required={required}>
      <Field.Label>
        {intlLabel
          ? intl.formatMessage(intlLabel)
          : intl.formatMessage({ id: `${PLUGIN_ID}.custom-fields.asset.label`, defaultMessage: 'Scaleflex Asset' })}
      </Field.Label>

      <Box marginTop={2}>
        {displayUrls.length > 0 && (
          <Box marginBottom={3} style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {storedItems.map((item, idx) => {
              const url = getItemUrl(item);
              const isHovered = hoveredUrl === url + idx;
              return (
                <Box
                  key={url + idx}
                  style={{ position: 'relative', display: 'inline-block', cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredUrl(url + idx)}
                  onMouseLeave={() => setHoveredUrl(null)}
                >
                  <img
                    src={url}
                    alt="Selected asset"
                    style={{
                      width: '100px',
                      height: '80px',
                      objectFit: 'cover',
                      display: 'block',
                      borderRadius: '4px',
                      transition: 'filter 0.15s ease',
                      filter: isHovered ? 'brightness(0.55)' : 'none',
                    }}
                  />

                  {isHovered && (
                    <button
                      type="button"
                      onClick={() => setPreviewIndex(idx)}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#fff',
                      }}
                    >
                      <Eye width="22px" height="22px" />
                    </button>
                  )}

                  {!disabled && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeItem(url); }}
                      style={{
                        position: 'absolute', top: '3px', right: '3px',
                        background: 'rgba(0,0,0,0.6)', color: '#fff',
                        border: 'none', borderRadius: '50%',
                        width: '18px', height: '18px', cursor: 'pointer',
                        fontSize: '11px', lineHeight: '18px', textAlign: 'center', padding: 0,
                        zIndex: 1,
                      }}
                    >
                      ×
                    </button>
                  )}
                </Box>
              );
            })}
          </Box>
        )}

        <Box style={{ display: 'flex', gap: '8px' }}>
          <Button
            variant="default"
            onClick={() => setIsOpen(true)}
            disabled={disabled || !isConfigured || atLimit}
          >
            {pickLabel()}
          </Button>

          {displayUrls.length > 0 && !disabled && (
            <Button
              variant="danger-light"
              onClick={() => onChange({ target: { name, value: '', type: attribute.type } })}
            >
              {intl.formatMessage({ id: `${PLUGIN_ID}.custom-fields.asset.clear`, defaultMessage: 'Clear' })}
            </Button>
          )}
        </Box>

        {!isConfigured && (
          <Typography variant="pi" textColor="danger600" marginTop={1}>
            {intl.formatMessage({ id: `${PLUGIN_ID}.label.fmaw.no_config`, defaultMessage: 'Please configure Scaleflex DAM credentials first.' })}
          </Typography>
        )}
      </Box>

      {pickerConfig && (
        <AssetPicker
          config={pickerConfig}
          open={isOpen}
          onSelect={handleSelect}
          onCancel={() => setIsOpen(false)}
        />
      )}

      {previewIndex !== null && (
        <PreviewModal
          items={storedItems}
          initialIndex={previewIndex}
          onClose={() => setPreviewIndex(null)}
          fieldTitles={fieldTitles}
        />
      )}

      <Field.Error />
    </Field.Root>
  );
};

export default AssetPickerInput;
