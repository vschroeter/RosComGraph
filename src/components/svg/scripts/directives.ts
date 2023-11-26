import {
  applyToPoint,
  compose,
  fromDefinition,
  fromTransformAttribute,
  identity,
  type Matrix,
} from 'transformation-matrix';
import { Orientation, type orientation } from './properties';
import {
  type Ref,
  ref,
  shallowRef,
  watch,
  onMounted,
  onUnmounted,
  nextTick,
  onBeforeUnmount,
  computed,
  type ShallowRef,
  toValue,
  ComponentPublicInstance,
} from 'vue';
import * as d3 from 'd3';
import { gsap } from 'gsap';
import { useDebounceFn, useThrottleFn } from '@vueuse/core';

/**
 * This directive is used to center a group element thus that its center is at (0, 0) relative to its parent.
 * @param el The SVG group element to be centered
 */
export const vCenteredGroup = (el: SVGGElement) => {
  // console.log("V-CENTERED-GROUP UPDATED");
  const bbox = el.getBBox();
  el.setAttribute(
    'transform',
    `translate(${-bbox.width / 2 - bbox.x}, ${-bbox.height / 2 - bbox.y})`
  );
};

export const vAutosizeSvg = (svgRef: SVGSVGElement, binding: any) => {
  const gRef = binding.value as SVGGElement;
  console.log('V-AUTOSIZE-GROUP UPDATED', svgRef, gRef);
  if (!gRef || !svgRef) return;

  nextTick(() => {
    const bbox = gRef.getBBox();
    console.log('V-AUTOSIZE-GROUP BBOX', bbox);
    // el.setAttribute("transform", `translate(${-bbox.width / 2 - bbox.x}, ${-bbox.height / 2 - bbox.y})`)

    const svg = d3.select(toValue(svgRef) as SVGSVGElement);
    const group = d3.select(toValue(gRef) as SVGGElement);

    const margin = 10;

    // Update the viewBox and svg size to the group box
    // const bbox = group.node()?.getBBox()
    if (bbox) {
      const x = bbox.x - margin;
      const y = bbox.y - margin;
      const width = bbox.width + margin * 2;
      const height = bbox.height + margin * 2;

      svg.attr('viewBox', `${x} ${y} ${width} ${height}`);
      svg.attr('width', width);
      svg.attr('height', height);
    }
  });
};

export type BBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export interface BackgroundRectAdaptionProps {
  ml?: number;
  mr?: number;
  mt?: number;
  mb?: number;
  minWidth?: number;
  minHeight?: number;
  align?: orientation;
}

export class BBoxAdaption {
  ml: number;
  mr: number;
  mt: number;
  mb: number;
  minWidth: number;
  minHeight: number;
  align: orientation;

  constructor({ ...props }: BackgroundRectAdaptionProps) {
    this.ml = props.ml ?? 0;
    this.mr = props.mr ?? 0;
    this.mt = props.mt ?? 0;
    this.mb = props.mb ?? 0;
    this.minWidth = props.minWidth ?? 0;
    this.minHeight = props.minHeight ?? 0;
    this.align = props.align ?? 'center';
  }
}

/**
 * This directive is used to adapt an SVG rect element relative to the given reference element, thus it can be used as background rect.
 * Use as follows: <rect v-background-rect:[style]="refElement" />
 * style is an optional object with the following properties:
 * - ml: The left margin
 * - mr: The right margin
 * - mt: The top margin
 * - mb: The bottom margin
 * - minWidth: The minimum width of the rect
 * - minHeight: The minimum height of the rect
 * - align: The alignment of the rect relative to the reference element. Possible values: "left", "center", "right"
 *
 * refElement is the reference element to which the rect should be adapted.
 *
 * @param el The SVG rect element to be adapted
 * @param binding The binding object
 */
export const vBackgroundRect = (el: SVGElement, binding: any) => {
  // console.log("V-ADAPT-TO-REF UPDATED", binding);
  let element = el;
  let ref = binding.value;

  const arg = binding.arg ?? undefined;
  const ml = arg?.ml ?? 0;
  const mr = arg?.mr ?? 0;
  const mt = arg?.mt ?? 0;
  const mb = arg?.mb ?? 0;
  const minWidth = arg?.minWidth ?? 0;
  const minHeight = arg?.minHeight ?? 0;
  const align = arg?.align ?? 'center';

  if (ref && Array.isArray(ref) && ref.length == 2) {
    element = ref[1];
    ref = ref[0];
  }

  if (ref) {
    const bbox = ref.getBBox();
    const width = Math.max(minWidth, bbox.width + ml + mr);
    const height = Math.max(minHeight, bbox.height + mt + mb);

    element.setAttribute('x', `${bbox.x - ml}`);
    element.setAttribute('y', `${bbox.y - mt}`);
    element.setAttribute('width', `${width}`);
    element.setAttribute('height', `${height}`);

    switch (align) {
      case 'left':
        element.setAttribute('transform', ``);
        break;
      case 'center':
        element.setAttribute(
          'transform',
          `translate(${-(width - bbox.width) / 2 + ml}, ${0})`
        );
        break;
      case 'right':
        element.setAttribute(
          'transform',
          `translate(${-(width - bbox.width - ml - mr)}, ${0})`
        );
        break;
      default:
        break;
    }
  }
};

export function useBackgroundRectUpdater(
  refContent: Ref<SVGGElement | null>,
  backgroundAdaption: Ref<BBoxAdaption | null> = ref(null),
  useMutationObserver = false,
  updateCallback: (() => void) | null = null
) {
  const refEl = ref<SVGRectElement | null>(null);
  const functionRef = (el: SVGRectElement | null) => (refEl.value = el);

  const observer = shallowRef<MutationObserver | null>(null);

  const x = ref(0);
  const y = ref(0);
  const contentWidth = ref(0);
  const contentHeight = ref(0);
  const width = ref(0);
  const height = ref(0);

  const centeredBbox = computed(() => {
    return {
      x: -width.value / 2, // - rectUpdater.x.value,
      y: -height.value / 2, // - rectUpdater.y.value, // rectUpdater.y.value,
      width: width.value,
      height: height.value,
    };
  });

  const bbox = computed(() => {
    return {
      x: x.value,
      y: y.value,
      width: width.value,
      height: height.value,
    };
  });

  const minBbox = computed(() => {
    return {
      x: x.value,
      y: y.value,
      width: contentWidth.value,
      height: contentHeight.value,
    };
  });

  const centeredTransform = computed(() => {
    return `translate(${-width.value / 2 - x.value}, ${
      -height.value / 2 - y.value
    })`;
  });

  const normalizeBbox = (bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) => {
    if (bbox.width < 0) {
      bbox.x += bbox.width;
      bbox.width = -bbox.width;
    }
    if (bbox.height < 0) {
      bbox.y += bbox.height;
      bbox.height = -bbox.height;
    }

    return bbox;
  };

  // TODO: can be partially replaced by computed values?
  const updateBackgroundRect = (
    bBox:
      | { x: number; y: number; width: number; height: number }
      | undefined = undefined
  ) => {
    if (refContent.value && refEl.value) {
      const adaption = backgroundAdaption.value ?? undefined;
      const ml = adaption?.ml ?? 0;
      const mr = adaption?.mr ?? 0;
      const mt = adaption?.mt ?? 0;
      const mb = adaption?.mb ?? 0;
      const minWidth = adaption?.minWidth ?? 0;
      const minHeight = adaption?.minHeight ?? 0;
      const align = adaption?.align ?? 'center';

      const bbox = bBox ? normalizeBbox(bBox) : refContent.value.getBBox();
      // console.log("BG UPDATE", bbox, refContent.value)
      const contWidth = bbox.width + ml + mr;
      const contHeight = bbox.height + mt + mb;

      const newWidth = Math.max(minWidth, contWidth);
      const newHeight = Math.max(minHeight, contHeight);

      let newX = bbox.x - ml;
      let newY = bbox.y - mt;

      if (align == 'center') {
        newX = bbox.x - (newWidth - bbox.width) / 2;
      } else if (align == 'right') {
        newX = bbox.x - (newWidth - bbox.width - mr);
      }

      // refEl.value.setAttribute("x", `${bbox.x - ml}`)
      // refEl.value.setAttribute("y", `${bbox.y - mt}`)
      // refEl.value.setAttribute("width", `${width}`)
      // refEl.value.setAttribute("height", `${height}`)
      if (x.value != newX) x.value = newX;
      if (y.value != newY) y.value = newY;
      if (contentWidth.value != bbox.width) contentWidth.value = contWidth;
      if (contentHeight.value != bbox.height) contentHeight.value = contHeight;
      if (width.value != newWidth) width.value = newWidth;
      if (height.value != newHeight) height.value = newHeight;
    } else {
      console.error('refContent.value is null useBackgroundRectUpdater');
    }
  };

  watch(backgroundAdaption, (newValue, oldValue) => {
    if (newValue) {
      console.log('# backgroundAdaption changed', newValue);
      updateBackgroundRect(minBbox.value);
    }
  });

  onMounted(() => {
    if (useMutationObserver && refContent.value && refEl.value) {
      // console.log("MOUNTED useBackgroundRectUpdater")
      observer.value = new MutationObserver(() => {
        if (refContent.value) {
          console.log('MUTATION DETECTED useBackgroundRectUpdater');
          updateBackgroundRect();
          nextTick(() => {
            if (updateCallback) {
              updateCallback();
            }
          });
        } else {
          // console.error("refContent.value is null useBackgroundRectUpdater")
        }
      });
      // observer.value.observe(refEl.value, { attributes: true, attributeFilter: ["x", "y", "width", "height"] })
      const config = { attributes: true, childList: true, subtree: true };
      observer.value.observe(refContent.value, config);
    } else {
      // console.error("refEl.value is null useBackgroundRectUpdater")
    }
    updateBackgroundRect();
    nextTick(() => {
      if (updateCallback) {
        updateCallback();
      }
    });
  });

  onBeforeUnmount(() => {
    if (observer.value) {
      observer.value.disconnect();
    }
  });

  // return { functionRef, updateBackgroundRect, x, y, width, height, centeredTransform, bbox, contentBbox }
  return {
    functionRef,
    updateBackgroundRect,
    centeredTransform,
    bbox,
    minBbox,
  };
}

export function calculateTransform(
  transformations: Array<string | Matrix | undefined | null>
) {
  const matrices = new Array<Matrix>();
  transformations.forEach((transformation) => {
    if (transformation === undefined || transformation === null) return;

    // if transformation is string, parse it
    if (typeof transformation === 'string') {
      const definition = transformation
        ? fromTransformAttribute(transformation)
        : undefined;
      const newMatrics = definition ? fromDefinition(definition) : [];
      matrices.push(...newMatrics);
    } else if (typeof transformation === 'object' && transformation !== null) {
      matrices.push(transformation);
    }
  });

  return matrices.length > 0 ? compose(matrices) : identity();
}

export function useElementBbox(
  bBoxAdaption: Ref<BBoxAdaption | null> = ref(null)
) {
  // The bbox of the content element
  const contentBbox = ref<BBox>({ x: 0, y: 0, width: 0, height: 0 });

  // The bbox of the content with margin
  const innerBbox = computed<BBox>(() => {
    const adaption = bBoxAdaption.value ?? undefined;
    const ml = adaption?.ml ?? 0;
    const mr = adaption?.mr ?? 0;
    const mt = adaption?.mt ?? 0;
    const mb = adaption?.mb ?? 0;

    return {
      x: contentBbox.value.x - ml,
      y: contentBbox.value.y - mt,
      width: contentBbox.value.width + ml + mr,
      height: contentBbox.value.height + mt + mb,
    };
  });

  // The outer bbox respecting margin, min width and min height
  const outerBbox = computed<BBox>(() => {
    const adaption = bBoxAdaption.value ?? undefined;
    // const ml = adaption?.ml ?? 0
    // const mr = adaption?.mr ?? 0
    // const mt = adaption?.mt ?? 0
    // const mb = adaption?.mb ?? 0
    const minWidth = adaption?.minWidth ?? 0;
    const minHeight = adaption?.minHeight ?? 0;
    const align = adaption?.align ?? 'center';

    const widthWithMin = Math.max(minWidth, innerBbox.value.width);
    const heightWithMin = Math.max(minHeight, innerBbox.value.height);

    let newX = innerBbox.value.x;
    let newY = innerBbox.value.y;

    if (align == 'center') {
      newX = innerBbox.value.x - (widthWithMin - innerBbox.value.width) / 2;
    } else if (align == 'right') {
      newX = innerBbox.value.x - (widthWithMin - innerBbox.value.width); // - mr
    }

    return {
      x: newX,
      y: newY,
      width: widthWithMin,
      height: heightWithMin,
    };
  });

  // The outer bbox but centered
  const centeredBbox = computed<BBox>(() => {
    return {
      x: -outerBbox.value.width / 2,
      y: -outerBbox.value.height / 2,
      width: outerBbox.value.width,
      height: outerBbox.value.height,
    };
  });

  // The transform to center the content
  const centeredTransform = computed(() => {
    return `translate(${-outerBbox.value.width / 2 - outerBbox.value.x}, ${
      -outerBbox.value.height / 2 - outerBbox.value.y
    })`;
  });

  function updateElementBbox(bBox: BBox | null = null) {
    contentBbox.value = normalizeBbox(bBox);
  }

  const normalizeBbox = (bbox: BBox | null) => {
    if (!bbox) return { x: 0, y: 0, width: 0, height: 0 };
    if (bbox.width < 0) {
      bbox.x += bbox.width;
      bbox.width = -bbox.width;
    }
    if (bbox.height < 0) {
      bbox.y += bbox.height;
      bbox.height = -bbox.height;
    }

    return bbox;
  };

  // If bbox is not based on manual input but instead should observe DOM element changes
  const observer = shallowRef<MutationObserver | null>(null);
  const refElement = shallowRef<Ref<SVGGElement | null> | null>(null);
  const callback = shallowRef<(() => void) | null>(null);
  function observeDomMutation(
    refContent: Ref<SVGGElement | null>,
    updateCallback: (() => void) | null = null
  ) {
    refElement.value = refContent;
    callback.value = updateCallback;
    initObserver();
  }

  function initObserver() {
    // console.log("initObserver", refElement.value, callback.value, observer.value)
    if (observer.value) {
      observer.value.disconnect();
    }
    if (callback.value && refElement.value && refElement.value.value) {
      // console.log("!! MOUNTED OBSERVER")
      observer.value = new MutationObserver(() => {
        if (refElement.value) {
          console.log('MUTATION DETECTED elementBboxObserver');
          updateElementBbox(refElement.value?.value?.getBBox());
          nextTick(() => {
            if (callback.value) {
              callback.value();
            }
          });
        } else {
          // console.error("refContent.value is null useBackgroundRectUpdater")
        }
      });
      // observer.value.observe(refEl.value, { attributes: true, attributeFilter: ["x", "y", "width", "height"] })
      const config = { attributes: true, childList: true, subtree: true };
      observer.value.observe(refElement.value.value, config);

      // Initial update
      updateElementBbox(refElement.value.value.getBBox());
      nextTick(() => {
        if (callback.value) {
          callback.value();
        }
      });
    }
  }

  onMounted(() => {
    initObserver();
  });

  onBeforeUnmount(() => {
    if (observer.value) {
      observer.value.disconnect();
    }
  });

  return {
    updateElementBbox,
    observeDomMutation,
    centeredTransform,
    centeredBbox,
    outerBbox,
    innerBbox,
    contentBbox,
  };
}

export function transformBoundingBox(
  bBox: { x: number; y: number; width: number; height: number },
  transformations:
    | Array<string | Matrix | undefined | null>
    | string
    | Matrix
    | undefined
    | null
) {
  // console.log("transformBoundingBox", bBox, transformations)
  if (transformations === undefined || transformations === null) return bBox;

  if (Array.isArray(transformations)) {
    let newBbox = bBox;
    transformations.forEach((transformation) => {
      newBbox = transformBoundingBox(newBbox, transformation);
    });
    return newBbox;
  }

  let matrix = transformations;

  // if transformation is string, parse it
  if (typeof transformations === 'string') {
    const definition = transformations
      ? fromTransformAttribute(transformations)
      : undefined;
    const newMatrics = definition ? fromDefinition(definition) : [];
    matrix = newMatrics.length > 0 ? compose(newMatrics) : identity();
  }

  matrix = matrix as Matrix;
  const startT = applyToPoint(matrix, { x: bBox.x, y: bBox.y });
  const endT = applyToPoint(matrix, {
    x: bBox.x + bBox.width,
    y: bBox.y + bBox.height,
  });

  return {
    x: Math.min(startT.x, endT.x),
    y: Math.min(startT.y, endT.y),
    width: Math.abs(endT.x - startT.x),
    height: Math.abs(endT.y - startT.y),
    // startX: startT.x,
    // startY: startT.y,
    // endX: endT.x,
    // endY: endT.y,
  };
}

export const useAnchorTransform = (
  bbox: Ref<BBox>,
  anchor: Ref<orientation> | orientation
) => {
  return computed<string>(() => {
    let x = undefined;
    let y = undefined;

    const anchorVal = toValue(anchor);

    if (anchorVal === 'lefttop') {
      x = -bbox.value.x;
      y = -bbox.value.y;
    } else if (anchorVal === 'leftcenter') {
      x = -bbox.value.x;
      y = -bbox.value.y - bbox.value.height / 2;
    } else if (anchorVal === 'leftbottom') {
      x = -bbox.value.x;
      y = -bbox.value.y - bbox.value.height;
    } else if (anchorVal === 'righttop') {
      x = -bbox.value.x - bbox.value.width;
      y = -bbox.value.y;
    } else if (anchorVal === 'rightcenter') {
      x = -bbox.value.x - bbox.value.width;
      y = -bbox.value.y - bbox.value.height / 2;
    } else if (anchorVal === 'rightbottom') {
      x = -bbox.value.x - bbox.value.width;
      y = -bbox.value.y - bbox.value.height;
    } else if (anchorVal === 'middletop') {
      x = -bbox.value.x - bbox.value.width / 2;
      y = -bbox.value.y;
    } else if (anchorVal === 'middlebottom') {
      x = -bbox.value.x - bbox.value.width / 2;
      y = -bbox.value.y - bbox.value.height;
    } else if (anchorVal === 'center') {
      x = -bbox.value.x - bbox.value.width / 2;
      y = -bbox.value.y - bbox.value.height / 2;
    } else {
      return '';
    }

    // console.log("useAnchorTransform", bbox.value, anchorVal, `translate(${x ?? 0}, ${y ?? 0})`)

    return `translate(${x ?? 0}, ${y ?? 0})`;
  });
};

export function useViewBoxGetter(
  bBoxGetter: () => BBox | null | undefined,
  margin: Ref<number> | number = 10,
  transition = 0.5,
  hystreresis = 50,
  useDebounce = true
) {
  // const viewBox = ref<string>("0 0 0 0")

  const x = ref(0);
  const y = ref(0);
  const width = ref(0);
  const height = ref(0);

  const viewBox = computed(() => {
    return `${x.value} ${y.value} ${width.value} ${height.value}`;
  });

  const targetX = ref(0);
  const targetY = ref(0);
  const targetWidth = ref(0);
  const targetHeight = ref(0);

  const debouncedTo = useDebounceFn(
    () => {
      // useThrottleFn
      to(x, targetX.value);
      to(y, targetY.value);
      to(width, targetWidth.value);
      to(height, targetHeight.value);
    },
    100,
    { maxWait: 500 }
  ); //

  function to(target: Ref<number>, value: number) {
    // Check if new value is within hystreresis
    if (Math.abs(target.value - value) < hystreresis) return;
    gsap.to(target, { duration: transition, value: value });
  }

  watch(
    bBoxGetter,
    () => {
      const bBox = bBoxGetter();
      const marginVal = toValue(margin);
      if (!bBox) {
        // to(x, 0)
        // to(y, 0)
        // to(width, 0)
        // to(height, 0)
      } else {
        targetX.value = bBox.x - marginVal;
        targetY.value = bBox.y - marginVal;
        targetWidth.value = bBox.width + marginVal * 2;
        targetHeight.value = bBox.height + marginVal * 2;

        // if (
        //   targetWidth.value >= width.value ||
        //   targetHeight.value >= height.value
        // ) {
        //   targetX.value -= marginVal;
        //   targetY.value -= marginVal;
        //   targetWidth.value += marginVal * 2;
        //   targetHeight.value += marginVal * 2;
        // }

        if (useDebounce) {
          debouncedTo();
        } else {
          to(x, targetX.value);
          to(y, targetY.value);
          to(width, targetWidth.value);
          to(height, targetHeight.value);
        }
      }
    },
    { immediate: true }
  );
  return viewBox;
}

export function svgInteractiveRef(
  svgRef: Ref<SVGElement | null>,
  transformCallback:
    | ((transform: d3.ZoomTransform) => void)
    | undefined = undefined,
  dblclickCallback: (() => void) | undefined = undefined
) {
  const elementRef = ref<SVGSVGElement | null>(null);

  const funcRef = (el: SVGSVGElement | null) => {
    elementRef.value = el;
  };

  const lastTransform = shallowRef(d3.zoomIdentity);
  const svgSelection = ref<d3.Selection<
    SVGSVGElement,
    unknown,
    null,
    undefined
  > | null>(null);
  const zoom = ref<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  onMounted(() => {
    console.log('svgInteractiveRef onMounted', elementRef.value, svgRef.value);

    const svg = d3.select(svgRef.value as SVGSVGElement);
    svgSelection.value = svg;

    zoom.value = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 20])
      .on('zoom', zoomed);

    svg.call(zoom.value).on('dblclick.zoom', () => {
      resetZoom();
      if (dblclickCallback) {
        dblclickCallback();
      }
    });
  });

  function resetZoom(duration = 200) {
    const svg = svgSelection.value;
    if (svg && zoom.value) {
      svg
        .transition()
        .duration(duration)
        .call(zoom.value.transform, d3.zoomIdentity);
      lastTransform.value = d3.zoomIdentity;
    }
  }

  function zoomed(event: d3.D3ZoomEvent<SVGSVGElement, unknown>) {
    // console.log('zoomed', event)
    const g = d3.select(elementRef.value as SVGSVGElement);

    // if (!(event.transform.k && event.transform.x && event.transform.y)) {
    //     return
    // }

    if (lastTransform.value.k == event.transform.k) {
      g.attr('transform', event.transform.toString());
    } else {
      g.transition()
        .duration(200)
        .attr('transform', event.transform.toString());
    }

    lastTransform.value = event.transform;
    if (transformCallback) {
      transformCallback(event.transform);
    }
  }

  return { ref: funcRef, resetZoom: resetZoom };
}
