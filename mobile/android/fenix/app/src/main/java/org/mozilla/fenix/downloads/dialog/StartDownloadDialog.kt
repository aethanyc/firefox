/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.mozilla.fenix.downloads.dialog

import android.app.Activity
import android.app.Dialog
import android.view.Gravity
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.Window
import androidx.annotation.VisibleForTesting
import androidx.coordinatorlayout.widget.CoordinatorLayout
import androidx.core.view.children
import androidx.viewbinding.ViewBinding
import mozilla.components.concept.base.crash.Breadcrumb
import mozilla.components.feature.downloads.databinding.MozacDownloaderChooserPromptBinding
import mozilla.components.feature.downloads.ui.DownloaderApp
import mozilla.components.feature.downloads.ui.DownloaderAppAdapter
import org.mozilla.fenix.R
import org.mozilla.fenix.databinding.DialogScrimBinding
import org.mozilla.fenix.ext.components
import org.mozilla.fenix.ext.settings

/**
 * Parent of all download views that can mimic a modal [Dialog].
 *
 * @param activity The [Activity] in which the dialog will be shown.
 * Used to update the activity [Window] to best mimic a modal dialog.
 */
abstract class StartDownloadDialog(
    private val activity: Activity,
) {
    @VisibleForTesting(otherwise = VisibleForTesting.PROTECTED)
    internal var binding: ViewBinding? = null

    @VisibleForTesting(otherwise = VisibleForTesting.PROTECTED)
    internal var container: ViewGroup? = null
    private var scrim: DialogScrimBinding? = null

    @VisibleForTesting
    internal var onDismiss: () -> Unit = {}

    /**
     * Show the download view.
     *
     * @param container The [ViewGroup] in which the download view will be inflated.
     */
    fun show(container: ViewGroup): StartDownloadDialog {
        activity.components.analytics.crashReporter.recordCrashBreadcrumb(
            Breadcrumb("StartDownloadDialog show"),
        )
        this.container = container

        val dialogParent = container.parent as? ViewGroup
        dialogParent?.let {
            scrim = DialogScrimBinding.inflate(LayoutInflater.from(activity), dialogParent, true).apply {
                this.scrim.setOnClickListener {
                    // Empty listener needed to prevent clicking through.
                }
            }
        }

        setupView()

        if (activity.settings().accessibilityServicesEnabled) {
            disableSiblingsAccessibility(dialogParent)
        }

        container.apply {
            val params = layoutParams as CoordinatorLayout.LayoutParams
            params.gravity = Gravity.BOTTOM or Gravity.CENTER_HORIZONTAL
            layoutParams = params

            // Set a higher elevation than the toolbar sibling which we should cover.
            elevation = activity.resources.getDimension(R.dimen.browser_fragment_above_toolbar_panels_elevation)
            visibility = View.VISIBLE
        }
        return this
    }

    /**
     * Set a callback for when the download view is dismissed.
     *
     * @param callback The callback for when the view is dismissed.
     */
    fun onDismiss(callback: () -> Unit): StartDownloadDialog {
        activity.components.analytics.crashReporter.recordCrashBreadcrumb(
            Breadcrumb("StartDownloadDialog onDismiss"),
        )
        this.onDismiss = callback
        return this
    }

    /**
     * Immediately dismiss the current download view if it is shown.
     * This will restore the previous UI removing any other layout / window customizations.
     */
    fun dismiss() {
        scrim?.let {
            (it.root.parent as? ViewGroup)?.removeView(it.root)
        }
        binding?.let {
            (it.root.parent as? ViewGroup)?.removeView(it.root)
        }
        enableSiblingsAccessibility(container?.parent as? ViewGroup)

        container?.visibility = View.GONE

        onDismiss()
    }

    @VisibleForTesting
    internal fun enableSiblingsAccessibility(parent: ViewGroup?) {
        parent?.children
            ?.filterNot { it.id == R.id.startDownloadDialogContainer }
            ?.forEach {
                it.setImportantForAccessibility(View.IMPORTANT_FOR_ACCESSIBILITY_YES)
            }
    }

    @VisibleForTesting
    internal fun disableSiblingsAccessibility(parent: ViewGroup?) {
        parent?.children
            ?.filterNot { it.id == R.id.startDownloadDialogContainer }
            ?.forEach {
                it.setImportantForAccessibility(View.IMPORTANT_FOR_ACCESSIBILITY_NO_HIDE_DESCENDANTS)
            }
    }

    /**
     * Bind all download data to the download view.
     */
    @VisibleForTesting(otherwise = VisibleForTesting.PROTECTED)
    internal abstract fun setupView()
}

/**
 * A download view mimicking a modal dialog that presents the user with a list of all apps
 * that can handle the download request.
 *
 * @param activity The [Activity] in which the dialog will be shown.
 * Used to update the activity [Window] to best mimic a modal dialog.
 * @param downloaderApps List of all applications that can handle the download request.
 * @param onAppSelected Callback for when the user chooses a specific application to handle the download request.
 * @param negativeButtonAction Callback for when the user interacts with the dialog to dismiss it.
 */
class ThirdPartyDownloadDialog(
    private val activity: Activity,
    private val downloaderApps: List<DownloaderApp>,
    private val onAppSelected: (DownloaderApp) -> Unit,
    private val negativeButtonAction: () -> Unit,
) : StartDownloadDialog(activity) {
    override fun setupView() {
        val dialog = MozacDownloaderChooserPromptBinding.inflate(LayoutInflater.from(activity), container, true)
            .also { binding = it }

        val recyclerView = dialog.appsList
        recyclerView.adapter = DownloaderAppAdapter(activity, downloaderApps) { app ->
            onAppSelected(app)
            dismiss()
        }

        dialog.closeButton.setOnClickListener {
            negativeButtonAction()
            dismiss()
        }
    }
}
