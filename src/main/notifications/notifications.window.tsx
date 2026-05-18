import { CLASS } from "@const/class";
import { Astal, Gtk } from "ags/gtk4";
import app from "ags/gtk4/app";
import AstalNotifd from "gi://AstalNotifd?version=0.1";
import { Accessor, createBinding, createComputed, For, With } from "gnim";
import styles from "./notifications.window.style";
import { Destroyer } from "@util/destroyer";
import Gtk4LayerShell from "gi://Gtk4LayerShell?version=1.0";
import { Notification } from "./notification";

const RIGHT_MARGIN = 10;

export function NotificationsWindow() {
	const notifd = AstalNotifd.get_default();
	const visible = createBinding(notifd, "notifications").as(
		(notifications) => !!notifications.length,
	);

	const window = (
		<window
			visible={visible}
			name="notifications"
			namespace={`${CLASS}_notifications`}
			anchor={Astal.WindowAnchor.RIGHT}
			application={app}
			class={CLASS}
			layer={Astal.Layer.OVERLAY}
			marginRight={10}
			widthRequest={300}
		>
			<box
				orientation={Gtk.Orientation.VERTICAL}
				valign={Gtk.Align.START}
				onRealize={(container) => {
					const destroyer = new Destroyer();
					destroyer.addDisconnect(
						container,
						container.connect("unrealize", () => destroyer.destroy()),
					);

					const paintable = new Gtk.WidgetPaintable({
						widget: container,
					});

					destroyer.addDisconnect(
						paintable,
						paintable.connect("invalidate-size", () => {
							// jiggle layer to force compositor to resize
							Gtk4LayerShell.set_margin(
								window,
								Gtk4LayerShell.Edge.RIGHT,
								RIGHT_MARGIN + 1,
							);
							Gtk4LayerShell.set_margin(
								window,
								Gtk4LayerShell.Edge.RIGHT,
								RIGHT_MARGIN,
							);
						}),
					);
				}}
			>
				<For
					each={
						createBinding(notifd, "notifications") as Accessor<
							AstalNotifd.Notification[]
						>
					}
				>
					{(notification) => <Notification notification={notification} />}
				</For>
			</box>
		</window>
	) as Gtk.Window;

	return window;
}
