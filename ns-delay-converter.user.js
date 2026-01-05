// ==UserScript==
// @name         NS Delay Time Converter
// @namespace    https://github.com/0xMH
// @version      1.0.0
// @description  Shows actual departure/arrival times on NS.nl by calculating scheduled time + delay
// @author       0xMH
// @match        https://www.ns.nl/*
// @grant        none
// @run-at       document-idle
// @license      MIT
// @homepageURL  https://github.com/0xMH/ns-delay-converter
// @supportURL   https://github.com/0xMH/ns-delay-converter/issues
// ==/UserScript==

(function() {
    'use strict';

    function timeToMinutes(timeStr) {
        const match = timeStr.match(/(\d{1,2}):(\d{2})/);
        if (!match) return null;
        return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
    }

    function minutesToTime(totalMinutes) {
        totalMinutes = ((totalMinutes % 1440) + 1440) % 1440;
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }

    function calculateActualTime(scheduledTime, delayMinutes) {
        const scheduledMinutes = timeToMinutes(scheduledTime);
        if (scheduledMinutes === null) return null;
        return minutesToTime(scheduledMinutes + delayMinutes);
    }

    function parseDelayText(text) {
        const match = text.match(/([+-])(\d+)/);
        if (!match) return null;

        const sign = match[1];
        let delayStr = match[2];

        // Handle duplicated delay text (NS quirk)
        if (delayStr.length % 2 === 0 && delayStr.length >= 2) {
            const half = delayStr.length / 2;
            const firstHalf = delayStr.substring(0, half);
            const secondHalf = delayStr.substring(half);
            if (firstHalf === secondHalf) {
                delayStr = firstHalf;
            }
        }

        const delay = parseInt(delayStr, 10);
        return {
            minutes: sign === '-' ? -delay : delay,
            sign: sign,
            value: parseInt(delayStr, 10)
        };
    }

    function findTimeForDelay(delayEl) {
        const prevSibling = delayEl.previousElementSibling;
        if (prevSibling) {
            if (prevSibling.tagName.toLowerCase() === 'rio-jp-time') {
                return prevSibling.textContent.trim();
            }
            const text = prevSibling.textContent;
            const timeMatch = text.match(/(\d{1,2}:\d{2})/);
            if (timeMatch) {
                return timeMatch[1];
            }
        }

        const parent = delayEl.parentElement;
        if (parent) {
            const timeEl = parent.querySelector('rio-jp-time');
            if (timeEl) {
                return timeEl.textContent.trim();
            }
        }

        const grandparent = delayEl.parentElement?.parentElement;
        if (grandparent) {
            const timeEl = grandparent.querySelector('rio-jp-time');
            if (timeEl) {
                return timeEl.textContent.trim();
            }
        }

        return null;
    }

    function isInStopsList(delayEl) {
        return delayEl.closest('rio-jp-leg') ||
               delayEl.closest('rio-jp-stop') ||
               delayEl.closest('[class*="rio-jp-leg"]') ||
               delayEl.closest('.rio-jp-trip-container rio-jp-delay-container') ||
               delayEl.closest('[class*="nes-flex-col"]');
    }

    function processDelays() {
        const delayElements = document.querySelectorAll('rio-jp-delay:not([data-ns-converted])');

        delayElements.forEach(delayEl => {
            const delayText = delayEl.textContent.trim();
            if (!delayText || delayText === '') return;

            const delayInfo = parseDelayText(delayText);
            if (!delayInfo || delayInfo.minutes === 0) return;

            const timeText = findTimeForDelay(delayEl);
            if (!timeText) return;

            const actualTime = calculateActualTime(timeText, delayInfo.minutes);
            if (!actualTime) return;

            const delaySpan = delayEl.querySelector('.rio-jp-delay');
            if (delaySpan) {
                if (isInStopsList(delayEl)) {
                    delaySpan.innerHTML = `<span class="ns-delay-row"><span class="rio-jp-delay-sign">${delayInfo.sign}</span>${delayInfo.value}</span><span class="ns-actual-time ns-stacked">(${actualTime})</span>`;
                    delaySpan.classList.add('ns-stacked-container');
                } else {
                    delaySpan.innerHTML = `<span class="rio-jp-delay-sign">${delayInfo.sign}</span>${delayInfo.value}<span class="ns-actual-time">(${actualTime})</span>`;
                }
                delaySpan.title = `Scheduled: ${timeText} → Actual: ${actualTime}`;
            }

            delayEl.dataset.nsConverted = 'true';
        });
    }

    function init() {
        const style = document.createElement('style');
        style.textContent = `
            .ns-actual-time {
                color: #0063d3 !important;
                font-weight: 600 !important;
                font-size: 0.9em;
                margin-left: 2px;
                white-space: nowrap;
            }

            .ns-stacked-container {
                display: flex !important;
                flex-direction: column !important;
                align-items: flex-start !important;
                line-height: 1.3 !important;
            }

            .ns-delay-row {
                display: block !important;
                white-space: nowrap !important;
            }

            .ns-actual-time.ns-stacked {
                display: block !important;
                margin-left: 0 !important;
                margin-top: 2px;
                font-size: 0.85em;
            }

            .stop-details-grid {
                row-gap: 16px !important;
            }

            .nes-col-start-1:has(rio-jp-delay) {
                min-height: 45px !important;
                padding-bottom: 8px !important;
            }

            .nes-flex-col:has(rio-jp-delay) {
                padding-bottom: 10px !important;
            }
        `;
        document.head.appendChild(style);

        const runTimes = [500, 1000, 1500, 2000, 2500, 3000, 4000, 5000, 7000, 10000];
        runTimes.forEach(delay => setTimeout(processDelays, delay));

        const observer = new MutationObserver(() => {
            setTimeout(processDelays, 100);
            setTimeout(processDelays, 500);
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
