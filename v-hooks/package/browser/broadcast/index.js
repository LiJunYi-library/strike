import { reactive, ref, onBeforeUnmount } from "vue";

export function useBroadcast(channelKey, key, expose) {
  const channel = new BroadcastChannel(channelKey);
  const protos = Object.keys(expose);
  // if (key) channel[key] = expose;
  const parms = {
    [key]: protos,
  };

  function message(event) {
    const data = event.data;
    parms[data.key] = data.protos;

    if (event.data.code === 1) {
      channel.postMessage({ code: 2, message: "成功连接", key, protos });
    }

    if (event.data.code === 3) {
      try {
        const reset = expose[data.method](...data.args);
        // channel.postMessage({ code: 4, message: "方法CB", reset });
        console.log(reset);
      } catch (error) {
        //
      }
    }
  }

  channel.addEventListener("message", message);

  channel.postMessage({ code: 1, message: "发送连接", key, protos });

  onBeforeUnmount(() => {
    channel.removeEventListener("message", message);
    channel.close();
  });

  function applys(method, ...args) {
    channel.postMessage({ code: 3, message: "调用方法", method, args });
  }

  function apply(channelName, method, ...args) {}

  return { applys };
}
