## Release 4.0.6 - Sep 15, 2021

### Improvements

-   Search results now highlight matching keywords to make results easier and faster to read
-   Added the ability to copy the primary email address right from the contact widget
-   Attachment reminder - added support for Italian, Portuguese, Dutch and Polish
-   Added an informational message for cases where an image cannot be loaded due to it's hosting on http as opposed to https
-   Improved the search algorithm to include contacts in the "CC" and "BCC" fields when searching inside the "To" field
-   Placed the cursor auto-focus on the URL field when adding images or links from the composer

### Bug fixes

-   Fixed an issue where emails using special styles would be displayed with a message "Can't load styles"
-   Fixed an issue where an empty inbox would be displayed if quickly moving a large number of messages to another location several times
-   Fixed an issue where it was not possible to open contact settings when a contact email address was very long
-   Fixed an issue where the message selection would be reset if marking emails as unread and read quickly one after another
-   Adjusted styling for the banner displayed on emails where an expiration date is set
-   Fixed an issue where images in particular newsletters would appear either too big or too small
-   Fixed an issue where "Composer size" would be referred to as "Composer mode" in the top navigation bar quick settings

## Release 4.0.5 - Sep 1, 2021

### Improvements

-   Improved handling of drafts that have been sent from other clients
-   When clicking on the Refresh icon next to a location in the sidebar, filters are now preserved
-   Added a clearer notification text when a message is marked as not spam
-   Added autofocus to the name field of the modals used for creating folders and labels

### Bug fixes

-   Fixed an issue where an unnecessary character would be added at the end of a link confirmation URL
-   Fixed an issue where a request timeout would prevent a message with bigger attachments from sending
-   Fixed an issue where Shift+Click for selecting multiple items in a list would not work in compact density mode on Firefox
-   Fixed an issue where the subject and the body would not be populated when using a mailto: link in Firefox
-   Fixed an issue where conversation ordering was incorrect if several conversations have the exact same timestamp
-   Fixed an issue where on very rare occasions a negative attachments counter would be displayed

## Release 4.0.4 - Aug 18, 2021

### Improvements

-   ProtonMail as your default mail handler - set up your browser to open a new ProtonMail composer each time you click onto a mailto: link. Latest versions of Chrome, Brave, Firefox, Opera and Edge are supported.
-   Attachment reminder - ProtonMail will now remind you to add attachments if certain keywords are detected in your draft. Keyword detection respects your privacy and happens locally in the browser.
-   Improved the message expiration date experience by setting the default expiration period to 7 days
-   Marking a single message within a conversation as unread will now keep the conversation in question open
-   Use keyboard shortcuts in autocomplete suggestions (for example, "Enter" to select and "Esc" to cancel recipient suggestions in the composer)
-   Updated welcome banner messaging for free accounts
-   Contacts import - improved handling of some existing contact fields (Organization, Member, Gender, Language, Timezone, Country) and other fields that are not supported by Proton Contacts
-   Placed the autofocus on the name field when adding new or editing existing contacts

### Bug fixes

-   Fixed an issue where a Draft uploaded from a mobile client would only show on the Web version after a page refresh
-   Fixed wrong wording for the "Delete all" confirmation modals
-   Fixed an issue where an auto-reply end date that is before the start date could be entered
-   Fixed an issue where a newly added remote image would not be displayed in signatures under certain circumstances
-   Fixed an issue where reordering labels using drag&drop was too slow if having a big amount of labels
-   Fixed an issue where a dropdown field would sometimes disappear on the contacts import matching screen
-   Fixed an issue where the contact name would not be displayed if adding a new group while creating a new contact

## Release 4.0.3 — July 28, 2021

### Improvements

-   Added the ability to add an email address to a group directly during the contact creation process
-   Improved the error message shown when the maximum number of composers is reached
-   Improved the warning shown when trying to send to invalid recipients
-   Added the ability to add events that do not require a response to calendar

### Bug fixes

-   Fixed an issue where in some rare cases the message list view would not load
-   Fixed an issue where copy & pasted content in signatures would be sent incorrectly
-   Fixed an issue where an embedded image from a draft could not be removed on reopening
-   Fixed an issue where on rare occasions an embedded image would not be sent when deleting and undoing the delete action immediately
-   Fixed an issue where merging contacts could not proceed if all contacts are marked for deletion
-   Fixed an issue where custom field headings would be replaced by "Other" headings on contact import
-   Fixed an issue where the confirmation modal would display "Delete conversation" when deleting a single message
-   Fixed an issue where contacts containing specific characters could not be merged
-   Fixed an issue where incorrect attachment icons would be displayed for key, .zip and .ics files
-   Fixed an issue where duplicated recipients in the CC field could not be deleted if typing their email addresses manually beforehand
-   Fixed an issue where folder names would disappear when dragging something into them on light themes
-   Fixed an issue where a contact image would not be displayed if editing a contact just after adding it

## Release: 4.0.2 — July 14, 2021

### Improvements

-   Removed automatic domain suggestions in the autocomplete dropdown in the composer so that only saved contacts are now appearing as suggestions
-   Added the ability to change the mailbox layout, density and composer mode from the top navigation bar ("Settings" menu)
-   Updated attachment icons
-   Improved the display of remote and embedded images that are not loaded inside an email
-   Improved the messaging for cases where remote content cannot be loaded due to a certificate validity issue on sender's side
-   Improved error messaging for cases when a key associated with a calendar is deleted
-   Improved error messaging for cases where too many search results are found and the search needs to be further limited
-   Added headings to the Contacts widget to improve accessibility
-   Removed icons indicating Sent and Draft messages inside the Sent and Draft locations

### Bug fixes

-   Fixed an issue where the message format would be broken if changing from HTML to default composer mode back and forth several times
-   Fixed an issue where in some cases, embedded images would not be removed if deleting respective placeholders when forwarding an email
-   Fixed an issue where the translated version of a folder title would not be displayed inside the browser tab page title
-   Fixed an issue where an English version of a confirmation modal would be displayed for non-English versions

## Release: 4.0.1 — June 16, 2021

### Improvements

-   Added support for keyboard shortcuts inside dropdown menus
-   Improved and accelerated the loading of messages in the list view
-   Improved loading times of the composer when replying to/forwarding a message with a lot of attachments
-   Added a retry mechanism in cases where a message fails to load due to network issues
-   Added an inactive state to the composer if the focus is somewhere else
-   Improved contact search by adding diacritics support
-   Improved the way the focus returns to the previous element after closing the composer

### Bug fixes

-   Fixed an issue where the focus would be lost after taking action on messages in the list view using keyboard shortcuts
-   Fixed an issue where the contact widget would not be fully displayed for some screen resolutions
-   Fixed an issue where exporting a message containing an attachment with a decryption error would fail
-   Fixed an issue where the contact encryption status would not be updated if changing the status while the composer is open
-   Fixed an issue where contacts in a particular format could not be merged
-   Fixed an issue where images inserted from an external URL would not be displayed
-   Fixed an issue where a single message would be auto-focused when selecting a conversation in row layout
-   Fixed an issue where an update would not be visible on the web client if previously updated from a mobile client
-   Fixed an issue where an error message would be displayed when deleting messages on the last folder page
-   Fixed an issue where addresses in contacts would be displayed without line breaks
-   Fixed an issue where the specific folders icons were missing inside the "Move to" menu
-   Fixed an issue where the focus would disappear from the conversation if navigating to a draft message inside
-   Fixed an issue where the formatting option selected would not be highlighted in the composer toolbar
-   Fixed an issue where the "Trust key" banner would be displayed even if the key was already trusted
-   Fixed an issue where the notification option would appear disabled for folders created using the "Move to" menu in the navigation bar
-   Fixed an issue where the "Unread" filter would disappear in the responsive view
-   Fixed an issue where messages that were partially hidden below the toolbar could not be selected
-   Fixed an issue where empty groups would be suggested in the composer autocomplete element
-   Fixed an issue where selecting a date field in contacts and then changing the selection would result in the value being displayed incorrectly
-   Fixed an issue where on some occasions the Unsubscribe URL would be shown twice in the Unsubscribe confirmation modal

# Introducing the new ProtonMail!

## Release: 4.0.0 — June 8, 2021

Fully revamped, the latest version of ProtonMail has a modern design, more customization options, and improved usability. This means keeping your data private is even easier and more enjoyable. [Learn more about this release](https://protonmail.com/blog/new-protonmail-announcement).

### New features

-   **New design**: Clean layout and modern design provide a fresh look and better experience.
-   **Themes and layouts**: Customize your inbox with new themes, such as dark mode, and various layouts.
-   **Subfolders**: Manage your emails by people, topics, projects, etc.
-   **Preview attachments**: Preview PDF and image attachments before you open them. It's faster and more secure.
-   **Undo send**: Sent an email by mistake? Undo send with a single click right after the email goes out.
-   **App selector**: Quickly select and switch between different Proton services (Mail, Calendar, Drive, VPN).
-   **Persistent session**: Stay signed in without losing your user session, even after closing your browser.
-   **Calendar integration**: RSVP to calendar invitations directly from an email.
-   **Encrypted address book**: Securely store your contacts’ details.

### Improvements

-   **Quick filters**: Makes sorting and finding messages faster and easier.
-   **Keyboard shortcuts**: We have redesigned shortcuts so you can navigate your inbox and take action on messages with increased ease. Type "?" to view the shortcuts.
-   **Load time**: Faster load times for improved performance.
-   **Usability enhancements**: Create folders and labels from the sidebar and access contacts directly from the top navigation bar.
-   **Accessibility**: Improved contrast and screen reader friendliness make privacy truly accessible to all.

Thank you to our beta users for making ProtonMail the best secure email service available! We welcome your continued feedback on our current release. You can also report an issue or request a feature under "Help" in the top menu bar.
