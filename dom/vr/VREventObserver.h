/* -*- Mode: C++; tab-width: 8; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set ts=8 sts=2 et sw=2 tw=80: */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

#ifndef mozilla_dom_VREventObserver_h
#define mozilla_dom_VREventObserver_h

#include "mozilla/dom/VRDisplayEventBinding.h"
#include "nsISupportsImpl.h"  // for NS_INLINE_DECL_REFCOUNTING
#include "VRManagerChild.h"

class nsGlobalWindowInner;

namespace mozilla::dom {

class VREventObserver final : public gfx::VRManagerEventObserver {
 public:
  NS_INLINE_DECL_REFCOUNTING(VREventObserver, override)
  explicit VREventObserver(nsGlobalWindowInner* aGlobalWindow);

  void NotifyAfterLoad();
  void NotifyVRDisplayMounted(uint32_t aDisplayID) override;
  void NotifyVRDisplayUnmounted(uint32_t aDisplayID) override;
  void NotifyVRDisplayNavigation(uint32_t aDisplayID);
  void NotifyVRDisplayRequested(uint32_t aDisplayID);
  void NotifyVRDisplayConnect(uint32_t aDisplayID) override;
  void NotifyVRDisplayDisconnect(uint32_t aDisplayID) override;
  void NotifyVRDisplayPresentChange(uint32_t aDisplayID) override;
  void NotifyPresentationGenerationChanged(uint32_t aDisplayID) override;
  void NotifyEnumerationCompleted() override;
  void NotifyDetectRuntimesCompleted() override;

  void DisconnectFromOwner();
  void StartActivity();
  void StopActivity();
  bool GetStopActivityStatus() const override;

 private:
  ~VREventObserver();

  bool IsWebVR(uint32_t aDisplayID) const;

  RefPtr<nsGlobalWindowInner> mWindow;
  bool mIs2DView;
  bool mStopActivity;
};

}  // namespace mozilla::dom

#endif  // mozilla_dom_VREventObserver_h
