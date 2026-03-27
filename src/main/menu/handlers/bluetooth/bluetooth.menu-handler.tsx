import GObject from "gnim/gobject";
import { MenuHandler } from "../menu-handler";
import styles from "./bluetooth.menu-handler.style";
import AstalBluetooth from "gi://AstalBluetooth?version=0.1";
import { Gtk } from "ags/gtk4";
import {
	Accessor,
	createBinding,
	createComputed,
	createState,
	For,
	With,
} from "gnim";
import { ClickableListEntry } from "@components/clickable-list-entry/clickable-list-entry";
import { createCursorPointer } from "@util/ags";
import { ToggleButton } from "@components/toggle-button/toggle-button";
import { BluetoothDevice } from "@components/bluetooth-device/bluetooth-device";

export class BluetoothMenuHandler extends MenuHandler {
	constructor() {
		super("bluetooth");
	}

	public getContent(
		window: GObject.Object,
		data: string | number | null,
	): GObject.Object {
		const bt = AstalBluetooth.get_default();

		const [openDevice, setOpenDevice] =
			createState<AstalBluetooth.Device | null>(null);

		return (
			<box orientation={Gtk.Orientation.VERTICAL} widthRequest={250}>
				<box>
					<ToggleButton
						onClicked={() => {
							const adapter = bt.get_adapter();
							if (adapter) {
								adapter.set_powered(!adapter.powered);
							}
						}}
					>
						<With
							value={
								createBinding(bt, "adapter") as Accessor<AstalBluetooth.Adapter>
							}
						>
							{(adapter) => (
								<image
									iconName={createBinding(adapter, "powered").as((powered) =>
										powered
											? "bluetooth-active-symbolic"
											: "bluetooth-disabled-symbolic",
									)}
								/>
							)}
						</With>
					</ToggleButton>
				</box>
				<box orientation={Gtk.Orientation.VERTICAL}>
					<For
						each={
							createBinding(bt, "devices") as Accessor<AstalBluetooth.Device[]>
						}
					>
						{(value) => (
							<BluetoothDevice
								device={value}
								isOpen={openDevice.as((openDevice) => openDevice == value)}
								onClicked={() =>
									setOpenDevice((openDevice) => {
										if (openDevice == value) {
											return null;
										}
										return value;
									})
								}
							/>
						)}
					</For>
				</box>
			</box>
		);

		// throw new Error("Method not implemented.");
	}
}
