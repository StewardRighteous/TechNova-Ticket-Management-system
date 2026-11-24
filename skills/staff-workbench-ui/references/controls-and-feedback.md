# Controls and feedback

Use these recipes for individual elements and compact groups. The named components are TechNova reuse points. For other projects, apply the same visual and interaction rules to the host’s equivalents.

## Actions, text, and indicators

| Element | Recipe | TechNova reuse point |
| --- | --- | --- |
| Button and icon button | Use a filled accent for the primary action, an outline for a secondary action, a quiet treatment for low-emphasis actions, and a danger tone for destructive actions. Use inverse tones on dark surfaces. Give icon-only controls a stable hit area and an accessible name. Preserve width and show progress for pending actions. | `Button`, `Icon` |
| Action link and CTA | Use link semantics for navigation and button semantics for actions. Align the optional arrow or icon with the label. Keep compact header CTAs legible when their labels collapse on small screens. Indicate if an external link opens a new window. | `ActionLink`, `ExternalLink`, `CallToAction` |
| Heading and label | Keep page, section, dialog, and compact label styles consistent. Choose heading level for document structure and style through the variant. Associate field labels with controls and use muted text for supporting details. | `Heading`, `Label` |
| Icon and avatar | Keep one line-icon family and use fixed slots so aligned rows stay aligned. Hide decorative icons from assistive technology. Use a circular portrait or readable initials fallback for an avatar, with the person’s name alongside when needed. | `Icon`, `StaffAvatar` |
| Status, priority, and channel | Use short text inside a compact tint or icon-and-label badge. Keep state, priority, and source as distinct concepts. Use the host’s own mappings, such as amber for a deadline that is approaching and red for one that has passed. Pair a relative deadline with its absolute date where useful. | `StatusBadge`, `PriorityBadge`, `ChannelBadge` |

## Fields and editors

| Element | Recipe | TechNova reuse point |
| --- | --- | --- |
| Text, number, and multiline fields | Use consistent outlines and a visible label. Put an optional unit or trailing control in a stable slot. Mark required fields, associate hints and errors with the input, preserve text after errors, and let multiline fields grow or scroll naturally. | `Input`, `Textarea`, `FormField`, `FieldHint` |
| Date and time input | Use a labeled field or picker with a format cue when helpful. Keep start and end dates together and show range errors by the affected control. Include a time zone when it changes the meaning of the value. | `Input`, `FormField` |
| Checkbox and switch | Use checkboxes for items selected together or an explicit confirmation. Use a switch for a binary setting, with a label that stays constant as state changes. The label or row should provide a comfortable hit area without introducing a second toggle. | `Checkbox`, `CheckboxField`, `Switch`, `SettingRow` |
| Selection and chips | Use the main skill’s dropdown and combobox recipe. For tags, keep the entry field and selected chips in one wrapping group. Each removable chip has a named remove action. Use icon-and-label choices for a compact category or channel picker. | `SelectDropdown`, `ComboboxFilter`, `TagInput`, `ChannelSelector` |
| File or image input | Pair the input with a visible choose-file action and indicate supported formats where relevant. Show selected name or preview and a replace or remove action if supported. Keep the current asset visible while a replacement is pending, and surface validation by the input. | `Input`, `FormField`; see `CreateServicePage` and `ServiceEditDialog` |
| Password field | Label the input and give the reveal button an accessible label reflecting its next action. Keep it beside the field and preserve focus and entered text when toggled. Place sign-in failures near the form. | `Input`, `Button`, `FormField`; see `LoginPage` |
| Field help and actions | Use short visible help for required instructions and on-demand hints for supplementary detail. Align Cancel with the named commit action. While submitting, block duplicate saves and preserve the draft on failure. | `FieldHint`, `FormActions` |

## Feedback and notifications

| Element | Recipe | TechNova reuse point |
| --- | --- | --- |
| Empty, loading, and error states | Put the message where the content would appear. Distinguish first-use emptiness, no filter matches, loading, and failure. Keep relevant toolbar controls available and offer a clear next action such as clearing filters or retrying when useful. | `EmptyState`, `Button` |
| Inline feedback | Keep validation by the affected field and save feedback near the action. Use text plus an icon or semantic tone when useful. Announce dynamic feedback at an urgency appropriate to the message. | `FormField`, `FieldHint`, `Icon` |
| Notification rows and popover | Use a compact list with title first, supporting text and timestamp second, and an unread indicator. Anchor the popover to its named trigger, bound the list height, and keep any view-all or mark-read action distinct. Reuse the row treatment on the full notifications page. | `NotificationList`, `NotificationPopover`, `InteractiveListRow` |
| Toast | Use a short outcome, semantic tone, and a named dismiss control when dismissible. Keep multiple messages in a predictable stack. Use an appropriate live region and keep persistent failures visible near the relevant form or record. | `ToastList`; see `ToastNotificationContainer` |
