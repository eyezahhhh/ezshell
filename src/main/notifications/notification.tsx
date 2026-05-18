import AstalNotifd from "gi://AstalNotifd?version=0.1";
import {
	Accessor,
	createBinding,
	createComputed,
	createState,
	With,
} from "gnim";
import styles from "./notification.style";
import { Gtk } from "ags/gtk4";
import { createCursorPointer } from "@util/ags";
import GLib from "gi://GLib?version=2.0";
import { cc } from "@util/string";

interface Props {
	notification: AstalNotifd.Notification;
}

export function Notification({ notification }: Props) {
	const [visible, setVisible] = createState(false);
	const [opaque, setOpaque] = createState(false);

	GLib.idle_add(GLib.PRIORITY_DEFAULT, () => {
		setVisible(true);
		setTimeout(() => {
			setOpaque(true);
		}, 200);
		return GLib.SOURCE_REMOVE;
	});

	function dismiss() {
		setOpaque(false);
		setTimeout(() => setVisible(false), 200);
		setTimeout(() => {
			notification.dismiss();
		}, 400);
	}

	return (
		<revealer
			revealChild={visible}
			cssClasses={opaque.as((opaque) =>
				cc(styles.revealer, opaque && styles.visible),
			)}
			transitionType={Gtk.RevealerTransitionType.SLIDE_UP}
			transitionDuration={200}
		>
			<box cssClasses={[styles.container]}>
				<With
					value={
						createComputed(() => [
							createBinding(notification, "app_icon")(),
							createBinding(notification, "app_name")(),
						]) as Accessor<[string, string]>
					}
				>
					{([appIcon, appName]) => (
						<box orientation={Gtk.Orientation.VERTICAL}>
							{(appIcon || appName) && (
								<box cssClasses={[styles.appInfo]}>
									<box hexpand>
										{!!appIcon && (
											<image iconName={appIcon} cssClasses={[styles.appIcon]} />
										)}
										{!!appName && <label label={appName} />}
									</box>

									<button
										cssClasses={[styles.close]}
										cursor={createCursorPointer()}
										onClicked={dismiss}
									>
										<image iconName="window-close-symbolic" />
									</button>
								</box>
							)}

							<label
								label={createBinding(notification, "summary")}
								cssClasses={[styles.summary]}
								halign={Gtk.Align.START}
							/>
						</box>
					)}
				</With>
			</box>
		</revealer>
	);
}
